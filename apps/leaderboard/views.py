"""
Leaderboard ViewSet.

Endpoints:
  GET /api/v1/leaderboard/         - General (all-time) leaderboard
  GET /api/v1/leaderboard/weekly/  - Weekly leaderboard
  GET /api/v1/leaderboard/octagon/ - Octagon leaderboard

Uses Redis Sorted Sets as primary storage with DB fallback.
"""
import json
import logging
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.utils import get_redis_client

User = get_user_model()
logger = logging.getLogger(__name__)

# Redis keys
GENERAL_KEY = "leaderboard:general"
OCTAGON_KEY = "leaderboard:octagon"

# Default limits
DEFAULT_LIMIT = 50
MAX_LIMIT = 200


def _get_weekly_key() -> str:
    """Return the current week's leaderboard key and compute TTL until end of week."""
    today = timezone.now().date()
    # ISO weekday: Monday=0, Sunday=6
    days_until_sunday = 6 - today.weekday()
    end_of_week = today + timedelta(days=days_until_sunday)
    # End of week is end of Sunday (23:59:59)
    end_of_week_dt = datetime.combine(
        end_of_week, datetime.max.time(), tzinfo=timezone.get_current_timezone()
    )
    now = timezone.now()
    ttl_seconds = max(int((end_of_week_dt - now).total_seconds()), 0)
    return f"leaderboard:weekly:{today.strftime('%Y-%m-%d')}", ttl_seconds


def _db_aggregate_scores(limit: int = DEFAULT_LIMIT) -> list[dict]:
    """
    Fallback: aggregate scores from TestSession table.
    Groups by user_id, sums correct_answers, orders descending.
    Returns list of {userId, score}.
    """
    from apps.tests.models import TestSession

    rows = (
        TestSession.objects
        .values("user_id")
        .annotate(score=Sum("correct_answers"))
        .filter(score__isnull=False)
        .order_by("-score")[:limit]
    )
    return [{"userId": row["user_id"], "score": row["score"] or 0} for row in rows]


def _enrich_with_users(entries: list[dict]) -> list[dict]:
    """
    Bulk-fetch user profiles for a list of entries containing 'userId'.
    Returns entries augmented with firstName, lastName, avatarUrl.
    """
    user_ids = [e["userId"] for e in entries if e.get("userId")]
    if not user_ids:
        return entries

    users = User.objects.filter(id__in=user_ids).values(
        "id", "first_name", "last_name", "avatar_url"
    )
    user_map = {
        u["id"]: {
            "firstName": u["first_name"] or "",
            "lastName": u["last_name"] or "",
            "avatarUrl": u["avatar_url"] or "",
        }
        for u in users
    }

    result = []
    for entry in entries:
        uid = entry.get("userId")
        info = user_map.get(uid, {"firstName": "", "lastName": "", "avatarUrl": ""})
        result.append({
            "userId": uid,
            "firstName": info["firstName"],
            "lastName": info["lastName"],
            "avatarUrl": info["avatarUrl"],
            "score": entry.get("score", 0),
        })
    return result


def _refresh_redis_from_db(r, key: str, ttl_seconds: int) -> None:
    """
    Read aggregated scores from DB and write them into a Redis sorted set.
    Uses pipeline for batch operations.
    """
    scores = _db_aggregate_scores(limit=MAX_LIMIT)
    if not scores:
        return

    pipe = r.pipeline()
    # Clear existing entries for this key first
    pipe.delete(key)
    for entry in scores:
        member = json.dumps({"userId": entry["userId"]})
        pipe.zadd(key, {member: entry["score"]})
    pipe.expire(key, ttl_seconds)
    pipe.execute()
    logger.info("Refreshed Redis leaderboard key=%s with %d entries", key, len(scores))


def _get_sorted_set(r, key: str, ttl_seconds: int, limit: int = DEFAULT_LIMIT) -> list[dict]:
    """
    Retrieve top `limit` entries from a Redis sorted set (highest score first).
    If the key is missing or empty, fall back to DB aggregation and repopulate Redis.
    Returns list of {userId, score}.
    """
    # Check if key exists
    if not r.exists(key):
        logger.info("Redis key %s empty, falling back to DB", key)
        _refresh_redis_from_db(r, key, ttl_seconds)

    # ZREVRANGE: highest scores first
    raw = r.zrevrange(key, 0, limit - 1, withscores=True)

    if not raw:
        # Still empty after refresh attempt (no data in DB either)
        return []

    entries = []
    for member, score in raw:
        try:
            info = json.loads(member)
        except (json.JSONDecodeError, TypeError):
            info = {"userId": member}
        entries.append({
            "userId": info.get("userId"),
            "score": int(score),
        })
    return entries


class LeaderboardViewSet(viewsets.ViewSet):
    """
    Leaderboard ViewSet with Redis sorted sets and DB fallback.

    Actions:
      list()       - GET /api/v1/leaderboard/          (general / all-time)
      weekly()     - GET /api/v1/leaderboard/weekly/
      octagon()    - GET /api/v1/leaderboard/octagon/
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        """General (all-time) leaderboard.

        Redis key: leaderboard:general  (TTL 1 hour)
        """
        limit = min(int(request.query_params.get("limit", DEFAULT_LIMIT)), MAX_LIMIT)
        ttl = 3600  # 1 hour

        r = get_redis_client()
        entries = _get_sorted_set(r, GENERAL_KEY, ttl, limit)
        result = _enrich_with_users(entries)

        # Add rank
        for idx, entry in enumerate(result, 1):
            entry["rank"] = idx

        return Response({"leaderboard": result}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def weekly(self, request):
        """Weekly leaderboard.

        Redis key: leaderboard:weekly:YYYY-MM-DD  (TTL until end of week)
        """
        limit = min(int(request.query_params.get("limit", DEFAULT_LIMIT)), MAX_LIMIT)
        r = get_redis_client()
        week_key, ttl = _get_weekly_key()

        entries = _get_sorted_set(r, week_key, ttl, limit)
        result = _enrich_with_users(entries)

        for idx, entry in enumerate(result, 1):
            entry["rank"] = idx

        return Response({"leaderboard": result}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def octagon(self, request):
        """Octagon leaderboard (Octagon battle wins / scores).

        Redis key: leaderboard:octagon  (no TTL, persistent)
        """
        limit = min(int(request.query_params.get("limit", DEFAULT_LIMIT)), MAX_LIMIT)
        r = get_redis_client()

        entries = _get_sorted_set(r, OCTAGON_KEY, ttl_seconds=0, limit=limit)
        result = _enrich_with_users(entries)

        for idx, entry in enumerate(result, 1):
            entry["rank"] = idx

        return Response({"leaderboard": result}, status=status.HTTP_200_OK)
