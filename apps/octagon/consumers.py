"""
Octagon WebSocket consumers for 1v1 battles.

Handles real-time gameplay:
  - Player answer broadcasting
  - Score tracking and persistence
  - Match completion when all questions answered
  - Leaderboard updates
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone

from core.utils import get_redis_client
from .models import OctagonMatch, OctagonPlayer, OctagonStatus

# Redis key prefixes (same as views.py)
MATCH_ANSWERS_KEY_PREFIX = "octagon:match:{}:answers"
LEADERBOARD_KEY = "leaderboard:octagon"


class OctagonConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for 1v1 battles."""

    async def connect(self):
        self.match_id = self.scope["url_route"]["kwargs"]["match_id"]
        self.room_group_name = f"octagon_{self.match_id}"
        self.user = self.scope.get("user")

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        await self.accept()

        # Notify that player connected
        username = (
            self.user.username
            if self.user and hasattr(self.user, "username") and self.user.is_authenticated
            else "anonymous"
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_connected",
                "username": username,
            },
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name,
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "answer":
            await self.handle_answer(data)
        elif action == "skip":
            await self.handle_skip(data)
        elif action == "time_update":
            await self.handle_time_update(data)
        elif action == "end_match":
            await self.handle_end_match(data)

    # ------------------------------------------------------------------ #
    #  Action handlers
    # ------------------------------------------------------------------ #

    async def handle_answer(self, data):
        """Handle player answer: persist to DB, update Redis, broadcast, check completion."""
        question_id = data.get("question_id")
        answer_ids = data.get("answer_ids", [])
        time_spent = float(data.get("time_spent", 0))
        username = (
            self.user.username
            if self.user and hasattr(self.user, "username") and self.user.is_authenticated
            else "anonymous"
        )

        # Validate answer correctness (DB call)
        is_correct = await self._check_answer(question_id, answer_ids)

        # Calculate score
        score_delta = 0
        if is_correct:
            time_bonus = max(0, int(10 - time_spent))
            score_delta = 10 + time_bonus

        # Persist answer and update player score (DB)
        result = await self._persist_answer_and_score(
            self.match_id,
            self.user.id if self.user and self.user.is_authenticated else None,
            question_id,
            answer_ids,
            is_correct,
            score_delta,
            time_spent,
        )

        if not result:
            return

        new_score = result["total_score"]
        correct_count = result["correct_count"]

        # Store answer in Redis for fast access
        r = get_redis_client()
        answers_key = MATCH_ANSWERS_KEY_PREFIX.format(self.match_id)
        answer_record = json.dumps(
            {
                "user_id": self.user.id if self.user and self.user.is_authenticated else None,
                "username": username,
                "question_id": question_id,
                "answer_ids": answer_ids,
                "is_correct": is_correct,
                "score_delta": score_delta,
                "time_spent": time_spent,
                "ts": timezone.now().isoformat(),
            }
        )
        r.rpush(answers_key, answer_record)

        # Broadcast to opponent
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_answer",
                "question_id": question_id,
                "answer_ids": answer_ids,
                "is_correct": is_correct,
                "score_delta": score_delta,
                "time_spent": time_spent,
                "player": username,
                "total_score": new_score,
            },
        )

        # Check if match is complete (all questions answered by at least one player)
        match_complete = await self._check_match_complete(self.match_id)
        if match_complete:
            end_result = await self._complete_match_via_ws(self.match_id)
            if end_result:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "match_ended",
                        "winner": end_result["winner_id"],
                        "winner_username": end_result["winner_username"],
                        "final_scores": end_result["final_scores"],
                    },
                )

    async def handle_skip(self, data):
        """Handle player skip."""
        username = (
            self.user.username
            if self.user and hasattr(self.user, "username") and self.user.is_authenticated
            else "anonymous"
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_skip",
                "question_id": data.get("question_id"),
                "player": username,
            },
        )

    async def handle_time_update(self, data):
        """Handle time update."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "time_update",
                "remaining_time": data.get("remaining_time"),
            },
        )

    async def handle_end_match(self, data):
        """Handle explicit match end request (e.g., timer expired)."""
        end_result = await self._complete_match_via_ws(self.match_id)
        if end_result:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "match_ended",
                    "winner": end_result["winner_id"],
                    "winner_username": end_result["winner_username"],
                    "final_scores": end_result["final_scores"],
                },
            )

    # ------------------------------------------------------------------ #
    #  Event handlers (receive from group_send)
    # ------------------------------------------------------------------ #

    async def player_connected(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "player_connected",
                    "username": event["username"],
                }
            )
        )

    async def player_answer(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "opponent_answer",
                    "question_id": event["question_id"],
                    "answer_ids": event.get("answer_ids", []),
                    "is_correct": event["is_correct"],
                    "score_delta": event.get("score_delta", 0),
                    "time_spent": event["time_spent"],
                    "player": event["player"],
                    "total_score": event.get("total_score", 0),
                }
            )
        )

    async def player_skip(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "opponent_skip",
                    "question_id": event["question_id"],
                    "player": event["player"],
                }
            )
        )

    async def time_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "time_update",
                    "remaining_time": event["remaining_time"],
                }
            )
        )

    async def match_ended(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "match_ended",
                    "winner": event.get("winner"),
                    "winner_username": event.get("winner_username"),
                    "final_scores": event.get("final_scores", {}),
                }
            )
        )

    # ------------------------------------------------------------------ #
    #  Database helpers (sync -> async via database_sync_to_async)
    # ------------------------------------------------------------------ #

    @database_sync_to_async
    def _check_answer(self, question_id, answer_ids):
        """Check if submitted answer_ids match the correct answers for the question."""
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

    @database_sync_to_async
    def _persist_answer_and_score(
        self, match_id, user_id, question_id, answer_ids, is_correct, score_delta, time_spent
    ):
        """Persist answer score to OctagonPlayer and return updated stats."""
        try:
            match = OctagonMatch.objects.get(id=match_id)
            if match.status != OctagonStatus.IN_PROGRESS:
                return None

            if not user_id:
                return None

            player = OctagonPlayer.objects.select_for_update().get(
                match_id=match_id, user_id=user_id
            )

            player.score += score_delta
            if is_correct:
                player.correct_count += 1
            player.save(update_fields=["score", "correct_count"])

            return {
                "total_score": player.score,
                "correct_count": player.correct_count,
            }
        except (OctagonMatch.DoesNotExist, OctagonPlayer.DoesNotExist):
            return None

    @database_sync_to_async
    def _check_match_complete(self, match_id):
        """
        Check if all questions in the match have been answered.
        A match is complete when the total unique questions answered across both players
        equals the match questions_count.
        """
        try:
            match = OctagonMatch.objects.get(id=match_id)
            if match.status != OctagonStatus.IN_PROGRESS:
                return True

            r = get_redis_client()
            answers_key = MATCH_ANSWERS_KEY_PREFIX.format(match_id)

            # Count unique questions answered
            answers_raw = r.lrange(answers_key, 0, -1)
            answered_question_ids = set()
            for raw in answers_raw:
                try:
                    record = json.loads(raw)
                    answered_question_ids.add(record["question_id"])
                except (json.JSONDecodeError, KeyError):
                    continue

            # Match is complete when all questions have been answered
            return len(answered_question_ids) >= match.questions_count
        except OctagonMatch.DoesNotExist:
            return True

    @database_sync_to_async
    def _complete_match_via_ws(self, match_id):
        """Complete the match: determine winner, update DB + leaderboard.
        
        Returns a dict with winner info and final_scores for broadcasting,
        or None if the match is already completed or not found.
        """
        import json as _json

        try:
            match = OctagonMatch.objects.prefetch_related("players__user").get(id=match_id)
        except OctagonMatch.DoesNotExist:
            return None

        if match.status == OctagonStatus.COMPLETED:
            return None

        # Determine winner (highest score; tie -> lowest user_id)
        players = list(match.players.all().order_by("-score", "user_id"))
        winner = players[0].user if players else None

        # Complete match
        match.complete(winner=winner)

        # Update is_winner flags
        for player in match.players.all():
            player.is_winner = player.user == winner
            player.save(update_fields=["is_winner"])

        # Update Redis leaderboard
        r = get_redis_client()
        for player in match.players.all():
            member = _json.dumps(
                {
                    "user_id": player.user.id,
                    "username": player.user.username,
                }
            )
            r.zadd(LEADERBOARD_KEY, {member: player.score})

        # Build final scores
        final_scores = {}
        for player in match.players.all():
            final_scores[player.user.username] = {
                "score": player.score,
                "correct_count": player.correct_count,
                "is_winner": player.is_winner,
            }

        return {
            "winner_id": winner.id if winner else None,
            "winner_username": winner.username if winner else None,
            "final_scores": final_scores,
        }
