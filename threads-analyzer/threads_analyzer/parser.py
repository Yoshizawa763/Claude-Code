"""threads.com の Web 版が返す GraphQL / 埋め込み JSON から投稿情報を取り出す."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from typing import Any, Iterator, Optional

from .models import Post
from .utils import extract_hashtags, post_url

MEDIA_TYPES = {1: "画像", 2: "動画", 8: "カルーセル", 19: "テキスト"}

# 自分のアカウントでログインしている場合などに含まれる可能性があるキー
_VIEW_KEYS = ("view_count", "views", "impression_count")
_SAVE_KEYS = ("save_count", "saves", "bookmark_count")


def _int(v: Any) -> Optional[int]:
    if isinstance(v, bool):
        return None
    if isinstance(v, int):
        return v
    if isinstance(v, str) and v.isdigit():
        return int(v)
    return None


def _first_int(dicts: list[dict], keys: tuple[str, ...]) -> Optional[int]:
    for d in dicts:
        if not isinstance(d, dict):
            continue
        for k in keys:
            v = _int(d.get(k))
            if v is not None:
                return v
    return None


def _iter_post_dicts(obj: Any) -> Iterator[dict]:
    """JSON 全体を走査して「投稿っぽい」dict を列挙する."""
    stack = [obj]
    while stack:
        cur = stack.pop()
        if isinstance(cur, dict):
            if "taken_at" in cur and "code" in cur and isinstance(cur.get("user"), dict):
                yield cur
            stack.extend(cur.values())
        elif isinstance(cur, list):
            stack.extend(cur)


def _text_of(post: dict) -> str:
    caption = post.get("caption")
    if isinstance(caption, dict) and caption.get("text"):
        return caption["text"]
    tpai = post.get("text_post_app_info") or {}
    frags = ((tpai.get("text_fragments") or {}).get("fragments")) or []
    parts = []
    for f in frags:
        if isinstance(f, dict):
            parts.append(f.get("plaintext") or "")
    return "".join(parts)


def _topic_tag(tpai: dict) -> Optional[str]:
    th = tpai.get("tag_header")
    if isinstance(th, dict):
        return th.get("tag_cluster_name") or th.get("display_name") or th.get("name")
    if isinstance(th, str):
        return th
    return None


def post_from_dict(d: dict) -> Optional[Post]:
    user = d.get("user") or {}
    username = user.get("username")
    taken_at = _int(d.get("taken_at"))
    code = d.get("code")
    if not username or not taken_at or not code:
        return None
    tpai = d.get("text_post_app_info") or {}
    text = _text_of(d)
    pinned = bool(((tpai.get("pinned_post_info") or {}).get("is_pinned_to_profile")))
    view_holders = [d, tpai, tpai.get("public_view_count_card_attachment_info") or {}]
    return Post(
        post_id=str(d.get("pk") or d.get("id") or code),
        username=username,
        text=text,
        posted_at=datetime.fromtimestamp(taken_at, tz=timezone.utc),
        url=(d.get("permalink") or post_url(username, code)).replace("\\/", "/"),
        likes=_int(d.get("like_count")),
        replies=_int(tpai.get("direct_reply_count")),
        reposts=_int(tpai.get("repost_count")),
        quotes=_int(tpai.get("quote_count")),
        shares=_int(tpai.get("reshare_count")),
        views=_first_int(view_holders, _VIEW_KEYS),
        bookmarks=_first_int([d, tpai], _SAVE_KEYS),
        hashtags=extract_hashtags(text, [_topic_tag(tpai)]),
        media_type=MEDIA_TYPES.get(_int(d.get("media_type")) or -1, str(d.get("media_type") or "")),
        is_pinned=pinned,
    )


def extract_posts(data: Any, username: str) -> list[Post]:
    """指定ユーザー本人の投稿のみを返す（リポストした他人の投稿などは除外）."""
    target = username.lower()
    out = []
    for d in _iter_post_dicts(data):
        p = post_from_dict(d)
        if p and p.username.lower() == target:
            out.append(p)
    return out


_SCRIPT_RE = re.compile(
    r'<script type="application/json"[^>]*>(.*?)</script>', re.DOTALL
)


def extract_posts_from_html(html: str, username: str) -> list[Post]:
    """初期表示 HTML に埋め込まれた JSON から投稿を取り出す."""
    out: list[Post] = []
    for m in _SCRIPT_RE.finditer(html):
        body = m.group(1)
        if "taken_at" not in body:
            continue
        try:
            out.extend(extract_posts(json.loads(body), username))
        except json.JSONDecodeError:
            continue
    return out
