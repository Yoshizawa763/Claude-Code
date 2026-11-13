"""Threads 公式 API (Graph API) で「自分のアカウント」の投稿とインサイトを取得する.

必要な権限: threads_basic, threads_manage_insights
取得できる指標: views(表示回数), likes, replies, reposts, quotes, shares
※ ブックマーク(保存)数は公式 API に存在しないため取得できない。
"""
from __future__ import annotations

import time
from datetime import datetime
from typing import Any, Callable, Optional

import requests

from .models import FetchResult, Post
from .utils import extract_hashtags

BASE_URL = "https://graph.threads.net/v1.0"
METRICS = ("views", "likes", "replies", "reposts", "quotes", "shares")
POST_FIELDS = "id,text,timestamp,permalink,shortcode,media_type,topic_tag,is_quote_post,username"
MEDIA_TYPES = {
    "TEXT_POST": "テキスト",
    "IMAGE": "画像",
    "VIDEO": "動画",
    "CAROUSEL_ALBUM": "カルーセル",
    "AUDIO": "音声",
}


class ThreadsAPIError(RuntimeError):
    pass


class ThreadsAPI:
    def __init__(self, token: str, base_url: str = BASE_URL, session: Optional[requests.Session] = None):
        self.token = token
        self.base_url = base_url.rstrip("/")
        self.session = session or requests.Session()

    def _get(self, path_or_url: str, params: Optional[dict] = None) -> dict:
        url = path_or_url if path_or_url.startswith("http") else f"{self.base_url}/{path_or_url.lstrip('/')}"
        params = dict(params or {})
        if "access_token=" not in url:
            params["access_token"] = self.token
        for attempt in range(4):
            r = self.session.get(url, params=params, timeout=30)
            if r.status_code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(2 ** attempt * 2)
                continue
            try:
                body = r.json()
            except ValueError:
                body = {}
            if r.status_code >= 400 or "error" in body:
                err = body.get("error", {}) if isinstance(body, dict) else {}
                raise ThreadsAPIError(f"API エラー ({r.status_code}): {err.get('message') or r.text[:300]}")
            return body
        raise ThreadsAPIError("API へのリクエストが繰り返し失敗しました")

    def me(self) -> dict:
        return self._get("me", {"fields": "id,username"})

    def iter_threads(self, since: datetime):
        params: dict[str, Any] = {
            "fields": POST_FIELDS,
            "since": int(since.timestamp()),
            "limit": 100,
        }
        page = self._get("me/threads", params)
        while True:
            for item in page.get("data", []):
                yield item
            nxt = (page.get("paging") or {}).get("next")
            if not nxt:
                break
            page = self._get(nxt)

    def insights(self, media_id: str) -> dict[str, int]:
        try:
            body = self._get(f"{media_id}/insights", {"metric": ",".join(METRICS)})
            return _parse_insights(body)
        except ThreadsAPIError:
            # 一部の指標が未対応の投稿タイプがあるため、1 指標ずつ取り直す
            out: dict[str, int] = {}
            for m in METRICS:
                try:
                    out.update(_parse_insights(self._get(f"{media_id}/insights", {"metric": m})))
                except ThreadsAPIError:
                    pass
            return out


def _parse_insights(body: dict) -> dict[str, int]:
    out: dict[str, int] = {}
    for item in body.get("data", []):
        name = item.get("name")
        value = None
        if isinstance(item.get("total_value"), dict):
            value = item["total_value"].get("value")
        elif item.get("values"):
            value = item["values"][0].get("value")
        if name and isinstance(value, int):
            out[name] = value
    return out


def _parse_ts(ts: str) -> datetime:
    # 例: 2025-01-01T12:34:56+0000
    return datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z")


def fetch_posts_api(
    token: str,
    since: datetime,
    expected_username: Optional[str] = None,
    log: Callable[[str], None] = print,
    api: Optional[ThreadsAPI] = None,
) -> FetchResult:
    api = api or ThreadsAPI(token)
    me = api.me()
    username = me.get("username", "")
    if expected_username and username.lower() != expected_username.lower():
        raise ThreadsAPIError(
            f"アクセストークンのアカウント(@{username})と指定アカウント(@{expected_username})が異なります。"
            "公式 API では自分のアカウントのインサイトのみ取得できます。"
        )
    log(f"公式 API で @{username} の投稿を取得しています…")
    posts: list[Post] = []
    for item in api.iter_threads(since):
        if item.get("media_type") == "REPOST_FACADE":
            continue  # 他人の投稿のリポスト
        posted_at = _parse_ts(item["timestamp"])
        if posted_at < since:
            continue
        m = api.insights(item["id"])
        text = item.get("text") or ""
        posts.append(
            Post(
                post_id=item["id"],
                username=item.get("username") or username,
                text=text,
                posted_at=posted_at,
                url=item.get("permalink", ""),
                likes=m.get("likes"),
                replies=m.get("replies"),
                reposts=m.get("reposts"),
                quotes=m.get("quotes"),
                shares=m.get("shares"),
                views=m.get("views"),
                bookmarks=None,
                hashtags=extract_hashtags(text, [item.get("topic_tag")]),
                media_type=MEDIA_TYPES.get(item.get("media_type", ""), item.get("media_type", "")),
            )
        )
        if len(posts) % 20 == 0:
            log(f"  {len(posts)} 件取得")
    return FetchResult(
        username=username,
        posts=posts,
        source="api",
        notes=["ブックマーク(保存)数は Threads 公式 API で提供されていないため空欄です。"],
    )
