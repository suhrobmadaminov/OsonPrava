"""
Octagon 1v1 Battle REST API ViewSets.

Endpoints:
  POST /api/v1/octagon/find-match/       - Matchmaking (Redis queue)
  GET  /api/v1/octagon/match/{id}/       - Match details
  POST /api/v1/octagon/match/{id}/answer/ - Submit answer
  GET  /api/v1/octagon/history/          - Match history (last 20)
  GET  /api/v1/octagon/leaderboard/      - Top 50 players
"""
import json

from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.utils import get_redis_client
from .models import OctagonMatch, OctagonPlayer, OctagonStatus
from .serializers import (
    OctagonMatchSerializer,
)
from apps.questions.models import Question

# Redis key prefixes
QUEUE_KEY = "octagon:queue"
MATCH_KEY_PREFIX = "octagon:match:"
MATCH_ANSWERS_KEY_PREFIX = "octagon:match:{}:answers"
LEADERBOARD_KEY = "leaderboard:octagon"

# Matchmaking timeout (seconds) - how long a player stays in queue
QUEUE_TIMEOUT = 60


class OctagonMatchViewSet(viewsets.GenericViewSet):
    """ViewSet for Octagon 1v1 Battle operations."""

    serializer_class = OctagonMatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OctagonMatch.objects.filter(players__user=self.request.user).distinct()

    # ------------------------------------------------------------------ #
    #  POST /api/v1/octagon/find-match/
    # ------------------------------------------------------------------ #
    @action(detail=False, methods=["post"], url_path="find-match")
    def find_match(self, request):
        """
        Matchmaking via Redis queue.

        - Adds the current user to a waiting queue (Redis list).
        - If another player is already waiting, pops them and creates a match.
        - Returns the match object when paired, or a 'queued' status.
        """
        user = request.user
        r = get_redis_client()

        # Check if user is already in an active match
        active_match = OctagonMatch.objects.filter(
            players__user=user,
            status__in=[OctagonStatus.WAITING, OctagonStatus.IN_PROGRESS],
        ).first()

        if active_match:
            serializer = self.get_serializer(active_match)
            return Response(
                {"status": "already_in_match", "match": serializer.data},
                status=status.HTTP_200_OK,
            )

        # Check queue for an opponent
        # Queue stores JSON: {"user_id": ..., "username": ..., "ts": ...}
        opponent_data = r.lpop(QUEUE_KEY)

        if opponent_data:
            opponent_info = json.loads(opponent_data)
            opponent_id = opponent_info.get("user_id")

            # Make sure the opponent is still a valid user
            if opponent_id and opponent_id != user.id:
                # Create the match
                match = self._create_match_with_questions(opponent_id, user.id)
                serializer = self.get_serializer(match)

                # Store match metadata in Redis
                match_redis_key = f"{MATCH_KEY_PREFIX}{match.id}"
                r.hset(
                    match_redis_key,
                    mapping={
                        "id": str(match.id),
                        "player1_id": str(opponent_id),
                        "player2_id": str(user.id),
                        "status": OctagonStatus.IN_PROGRESS,
                    },
                )
                r.expire(match_redis_key, 3600)  # 1 hour TTL

                return Response(
                    {"status": "match_found", "match": serializer.data},
                    status=status.HTTP_201_CREATED,
                )

        # No opponent found - add current user to queue
        player_entry = json.dumps(
            {
                "user_id": user.id,
                "username": user.username,
                "ts": timezone.now().isoformat(),
            }
        )
        r.rpush(QUEUE_KEY, player_entry)
        r.expire(QUEUE_KEY, QUEUE_TIMEOUT)

        return Response(
            {"status": "queued", "message": "Searching for opponent..."},
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------ #
    #  GET /api/v1/octagon/match/{id}/
    # ------------------------------------------------------------------ #
    @action(detail=False, methods=["get"], url_path=r"match/(?P<match_id>\d+)")
    def get_match(self, request, match_id=None):
        """Get match details by ID."""
        try:
            match = OctagonMatch.objects.prefetch_related("players__user").get(id=match_id)
        except OctagonMatch.DoesNotExist:
            return Response(
                {"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Verify user is a participant
        if not match.players.filter(user=request.user).exists():
            return Response(
                {"error": "You are not a participant of this match"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(match)
        return Response({"match": serializer.data}, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------ #
    #  POST /api/v1/octagon/match/{id}/answer/
    # ------------------------------------------------------------------ #
    @action(
        detail=False, methods=["post"], url_path=r"match/(?P<match_id>\d+)/answer"
    )
    def submit_answer(self, request, match_id=None):
        """
        Submit an answer for a question in the match.

        Body: { "question_id": <int>, "answer_ids": [<int>, ...], "time_spent": <float> }

        Validates the answer, updates score in Redis, and persists to DB.
        """
        user = request.user
        question_id = request.data.get("question_id")
        answer_ids = request.data.get("answer_ids", [])
        time_spent = float(request.data.get("time_spent", 0))

        if not question_id:
            return Response(
                {"error": "question_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch match
        try:
            match = OctagonMatch.objects.select_related("winner").get(id=match_id)
        except OctagonMatch.DoesNotExist:
            return Response(
                {"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Verify participation
        player = match.players.filter(user=user).first()
        if not player:
            return Response(
                {"error": "You are not a participant of this match"},
                status=status.HTTP_403_FORBIDDEN,
            )

        if match.status != OctagonStatus.IN_PROGRESS:
            return Response(
                {"error": "Match is not in progress"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate question exists and is in this match
        if question_id not in match.question_ids:
            return Response(
                {"error": "Question is not part of this match"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check correctness
        is_correct = self._check_answer(question_id, answer_ids)

        # Calculate score: correct = 10 points + time bonus
        score_delta = 0
        if is_correct:
            time_bonus = max(0, int(10 - time_spent))  # Faster = more bonus
            score_delta = 10 + time_bonus

        # Update Redis answer store
        r = get_redis_client()
        answers_key = MATCH_ANSWERS_KEY_PREFIX.format(match_id)
        answer_record = json.dumps(
            {
                "user_id": user.id,
                "username": user.username,
                "question_id": question_id,
                "answer_ids": answer_ids,
                "is_correct": is_correct,
                "score_delta": score_delta,
                "time_spent": time_spent,
                "ts": timezone.now().isoformat(),
            }
        )
        r.rpush(answers_key, answer_record)

        # Update player score in DB
        player.score += score_delta
        if is_correct:
            player.correct_count += 1
        player.save(update_fields=["score", "correct_count"])

        return Response(
            {
                "is_correct": is_correct,
                "score_delta": score_delta,
                "total_score": player.score,
                "correct_count": player.correct_count,
            },
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------ #
    #  GET /api/v1/octagon/history/
    # ------------------------------------------------------------------ #
    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        """Get match history for the current user (last 20)."""
        matches = (
            OctagonMatch.objects.filter(players__user=request.user)
            .prefetch_related("players__user")
            .order_by("-created_at")[:20]
        )
        serializer = self.get_serializer(matches, many=True)
        return Response({"history": serializer.data}, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------ #
    #  GET /api/v1/octagon/leaderboard/
    # ------------------------------------------------------------------ #
    @action(detail=False, methods=["get"], url_path="leaderboard")
    def leaderboard(self, request):
        """
        Get top 50 players from Redis sorted set.

        Returns [{ "user_id", "username", "score", "rank" }]
        """
        r = get_redis_client()

        # ZREVRANGE returns members with scores (highest first)
        raw = r.zrevrange(LEADERBOARD_KEY, 0, 49, withscores=True)

        leaderboard = []
        for idx, (member, score) in enumerate(raw):
            # member is stored as JSON string: {"user_id": ..., "username": ...}
            try:
                info = json.loads(member)
            except (json.JSONDecodeError, TypeError):
                info = {"user_id": member, "username": member}

            leaderboard.append(
                {
                    "rank": idx + 1,
                    "user_id": info.get("user_id"),
                    "username": info.get("username", "Unknown"),
                    "score": int(score),
                }
            )

        return Response({"leaderboard": leaderboard}, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------ #
    #  POST /api/v1/octagon/complete-match/{id}/   (internal / WS trigger)
    # ------------------------------------------------------------------ #
    @action(
        detail=False, methods=["post"], url_path=r"match/(?P<match_id>\d+)/complete"
    )
    def complete_match(self, request, match_id=None):
        """
        Complete a match: determine winner, update DB, update leaderboard.

        Can be called via REST or triggered from WebSocket when time runs out.
        """
        try:
            match = OctagonMatch.objects.prefetch_related("players__user").get(
                id=match_id
            )
        except OctagonMatch.DoesNotExist:
            return Response(
                {"error": "Match not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if match.status == OctagonStatus.COMPLETED:
            serializer = self.get_serializer(match)
            return Response(
                {"status": "already_completed", "match": serializer.data},
                status=status.HTTP_200_OK,
            )

        winner = self._determine_winner(match)

        # Complete the match
        match.complete(winner=winner)

        # Update player records
        for player in match.players.all():
            player.is_winner = player.user == winner
            player.save(update_fields=["is_winner"])

        # Update leaderboard in Redis
        self._update_leaderboard(match)

        serializer = self.get_serializer(match)
        return Response(
            {
                "status": "match_completed",
                "winner_id": winner.id if winner else None,
                "winner_username": winner.username if winner else None,
                "match": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    # ================================================================ #
    #  Internal helpers
    # ================================================================ #

    def _create_match_with_questions(self, player1_id, player2_id):
        """Create a match with 10 random questions."""
        # Fetch 10 random active question IDs
        question_ids = list(
            Question.objects.filter(is_active=True)
            .order_by("?")[:10]
            .values_list("id", flat=True)
        )

        if len(question_ids) < 5:
            # Fallback: grab whatever we have
            question_ids = list(
                Question.objects.filter(is_active=True).values_list("id", flat=True)[:10]
            )

        match = OctagonMatch.objects.create(
            status=OctagonStatus.IN_PROGRESS,
            questions_count=len(question_ids),
            question_ids=question_ids,
            started_at=timezone.now(),
        )

        # Create player entries
        from django.contrib.auth import get_user_model

        User = get_user_model()
        try:
            p1_user = User.objects.get(id=player1_id)
            p2_user = User.objects.get(id=player2_id)
        except User.DoesNotExist:
            match.delete()
            raise ValueError("One or both users not found")

        OctagonPlayer.objects.create(match=match, user=p1_user)
        OctagonPlayer.objects.create(match=match, user=p2_user)

        return match

    @staticmethod
    def _check_answer(question_id, answer_ids):
        """
        Check if the provided answer_ids are correct for the question.
        Returns True if all correct answers are selected and no incorrect ones.
        """
        from questions.models import Answer

        correct_answers = set(
            Answer.objects.filter(question_id=question_id, is_correct=True).values_list(
                "id", flat=True
            )
        )
        submitted = set(answer_ids)

        if not correct_answers:
            return False

        return submitted == correct_answers

    @staticmethod
    def _determine_winner(match):
        """
        Determine the winner of a match.
        Winner = highest score. If tie, first player (player with lowest id).
        """
        players = list(match.players.all().order_by("-score", "user_id"))
        if not players:
            return None
        return players[0].user

    @staticmethod
    def _update_leaderboard(match):
        """
        Update Redis sorted set leaderboard after match completion.

        Adds both players' total scores to the leaderboard sorted set.
        """
        from django.contrib.auth import get_user_model

        User = get_user_model()
        r = get_redis_client()

        for player in match.players.all():
            # Calculate total wins / cumulative score for leaderboard
            # We use the player's current total score from DB
            member = json.dumps(
                {
                    "user_id": player.user.id,
                    "username": player.user.username,
                }
            )
            # ZADD with the player's total score
            r.zadd(LEADERBOARD_KEY, {member: player.score})

        # Optionally expire old entries - but leaderboard should persist
        # so we don't set TTL here.
