from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional


@dataclass
class Post:
    post_id: str
    username: str
    text: str
    posted_at: datetime  # timezone-aware (UTC)
    url: str
    likes: Optional[int] = None
    replies: Optional[int] = None
    reposts: Optional[int] = None
    quotes: Optional[int] = None
    shares: Optional[int] = None
    bookmarks: Optional[int] = None
    views: Optional[int] = None
    hashtags: list[str] = field(default_factory=list)
    media_type: str = ""
    is_pinned: bool = False


@dataclass
class FetchResult:
    username: str
    posts: list[Post]
    source: str  # "api" | "browser"
    notes: list[str] = field(default_factory=list)
