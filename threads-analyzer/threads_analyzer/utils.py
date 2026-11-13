from __future__ import annotations

import re
from typing import Iterable, Optional

_USERNAME_RE = re.compile(r"@([A-Za-z0-9._]{1,30})")
_PLAIN_USERNAME_RE = re.compile(r"^[A-Za-z0-9._]{1,30}$")

# 「#」「＃」の後ろに続く文字列をハッシュタグとみなす（URL の #fragment は除外）
_HASHTAG_RE = re.compile(r"(?<![A-Za-z0-9_/&])[#＃]([\wー々]+)")


def parse_username(value: str) -> str:
    """Threads のプロフィール/投稿 URL・@username・username からユーザー名を取り出す."""
    value = value.strip()
    m = _USERNAME_RE.search(value)
    if m:
        return m.group(1).rstrip(".")
    if _PLAIN_USERNAME_RE.match(value):
        return value
    raise ValueError(
        f"ユーザー名を読み取れませんでした: {value!r}\n"
        "例: https://www.threads.com/@username"
    )


def extract_hashtags(text: str, extra: Iterable[Optional[str]] = ()) -> list[str]:
    """本文中の #タグ と、Threads のトピックタグ(extra) を重複なしで返す."""
    tags: list[str] = []
    seen: set[str] = set()
    candidates = [t for t in extra if t] + _HASHTAG_RE.findall(text or "")
    for raw in candidates:
        tag = raw.lstrip("#＃").strip().rstrip("_")
        if not tag or tag.isdigit():
            continue
        key = tag.lower()
        if key not in seen:
            seen.add(key)
            tags.append(tag)
    return tags


def post_url(username: str, code: str) -> str:
    return f"https://www.threads.com/@{username}/post/{code}"
