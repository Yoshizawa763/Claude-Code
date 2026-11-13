from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest
from openpyxl import load_workbook

from threads_analyzer.api_client import ThreadsAPI, ThreadsAPIError, fetch_posts_api
from threads_analyzer.cli import months_ago
from threads_analyzer.excel_writer import write_excel
from threads_analyzer.models import FetchResult, Post
from threads_analyzer.parser import extract_posts, extract_posts_from_html
from threads_analyzer.utils import extract_hashtags, parse_username


# ---------- utils ----------
@pytest.mark.parametrize("value,expected", [
    ("https://www.threads.com/@my.account", "my.account"),
    ("https://www.threads.net/@my_account/post/ABC123?xmt=1", "my_account"),
    ("@someone", "someone"),
    ("someone", "someone"),
])
def test_parse_username(value, expected):
    assert parse_username(value) == expected


def test_parse_username_invalid():
    with pytest.raises(ValueError):
        parse_username("https://example.com/")


def test_extract_hashtags():
    text = "朝活中 #プログラミング と＃ＡＩ学習 https://a.com/#frag #123 #プログラミング"
    assert extract_hashtags(text, ["Threads活用", None]) == ["Threads活用", "プログラミング", "ＡＩ学習"]


def test_months_ago():
    assert months_ago(datetime(2026, 8, 31, tzinfo=timezone.utc), 6) == datetime(2026, 2, 28, tzinfo=timezone.utc)
    assert months_ago(datetime(2026, 11, 13, tzinfo=timezone.utc), 6) == datetime(2026, 5, 13, tzinfo=timezone.utc)


# ---------- browser parser ----------
def _gql_post(code, user, ts, likes, text, tag=None, pinned=False):
    return {
        "pk": code + "_pk", "code": code, "taken_at": ts, "like_count": likes, "media_type": 19,
        "user": {"username": user},
        "caption": {"text": text},
        "permalink": f"https:\\/\\/www.threads.com\\/@{user}\\/post\\/{code}",
        "text_post_app_info": {
            "direct_reply_count": 3, "repost_count": 2, "quote_count": 1, "reshare_count": 4,
            "tag_header": {"display_name": "x", "tag_cluster_name": tag} if tag else None,
            "pinned_post_info": {"is_pinned_to_profile": pinned},
        },
    }


GQL = {"data": {"mediaData": {"edges": [
    {"node": {"thread_items": [
        {"post": _gql_post("A1", "me", 1_790_000_000, 10, "hello #tag1", tag="Tech Threads")},
        {"post": _gql_post("A2", "me", 1_790_000_100, 5, "続き")},
    ]}},
    {"node": {"thread_items": [{"post": _gql_post("B1", "other", 1_790_000_000, 99, "not mine")}]}},
]}}}


def test_extract_posts_filters_user_and_maps_fields():
    posts = extract_posts(GQL, "Me")
    assert [p.post_id for p in posts] != []
    assert {p.url.rsplit("/", 1)[-1] for p in posts} == {"A1", "A2"}
    p = next(p for p in posts if p.text.startswith("hello"))
    assert (p.likes, p.replies, p.reposts, p.quotes, p.shares) == (10, 3, 2, 1, 4)
    assert p.views is None and p.bookmarks is None
    assert p.hashtags == ["Tech Threads", "tag1"]
    assert p.url == "https://www.threads.com/@me/post/A1"
    assert p.media_type == "テキスト"


def test_extract_posts_from_html():
    import json
    html = f'<html><script type="application/json" data-sjs>{json.dumps(GQL)}</script></html>'
    assert len(extract_posts_from_html(html, "me")) == 2


# ---------- API client ----------
class FakeResp:
    def __init__(self, body, status=200):
        self._body, self.status_code, self.text = body, status, str(body)

    def json(self):
        return self._body


class FakeSession:
    def __init__(self, routes):
        self.routes = routes
        self.calls = []

    def get(self, url, params=None, timeout=None):
        self.calls.append((url, params))
        for key, body in self.routes.items():
            if url.endswith(key):
                return FakeResp(body)
        return FakeResp({"error": {"message": "not found"}}, 400)


def test_fetch_posts_api():
    now = datetime(2026, 11, 13, tzinfo=timezone.utc)
    routes = {
        "/me": {"id": "1", "username": "me"},
        "/me/threads": {"data": [
            {"id": "10", "text": "新作 #告知", "timestamp": "2026-11-01T03:00:00+0000",
             "permalink": "https://www.threads.com/@me/post/X", "media_type": "TEXT_POST", "topic_tag": "Books"},
            {"id": "11", "media_type": "REPOST_FACADE", "timestamp": "2026-11-01T03:00:00+0000"},
            {"id": "12", "text": "old", "timestamp": "2026-01-01T00:00:00+0000", "media_type": "TEXT_POST"},
        ]},
        "/10/insights": {"data": [
            {"name": "views", "values": [{"value": 1000}]},
            {"name": "likes", "total_value": {"value": 50}},
            {"name": "replies", "values": [{"value": 4}]},
        ]},
    }
    api = ThreadsAPI("tok", session=FakeSession(routes))
    res = fetch_posts_api("tok", months_ago(now, 6), expected_username="me", log=lambda *_: None, api=api)
    assert res.source == "api"
    assert len(res.posts) == 1
    p = res.posts[0]
    assert (p.views, p.likes, p.replies) == (1000, 50, 4)
    assert p.hashtags == ["Books", "告知"]


def test_fetch_posts_api_rejects_other_account():
    api = ThreadsAPI("tok", session=FakeSession({"/me": {"id": "1", "username": "me"}}))
    with pytest.raises(ThreadsAPIError):
        fetch_posts_api("tok", datetime.now(timezone.utc), expected_username="someone", log=lambda *_: None, api=api)


# ---------- Excel ----------
def test_write_excel(tmp_path: Path):
    now = datetime(2026, 11, 13, 12, tzinfo=timezone.utc)
    posts = [
        Post(post_id=str(i), username="me", text=t, posted_at=now - timedelta(days=i * 10),
             url=f"https://www.threads.com/@me/post/{i}", likes=i * 10, replies=i, reposts=1,
             quotes=0, shares=2, views=(i * 100 or None), hashtags=["tag"] if i % 2 else [])
        for i, t in enumerate(["=SUM(1)はただの本文", "普通の投稿\n改行あり", "制御文字\x01入り", "４つ目"])
    ]
    out = write_excel(FetchResult("me", posts, "api", ["note"]), tmp_path / "o.xlsx",
                      now - timedelta(days=180), now, ZoneInfo("Asia/Tokyo"))
    wb = load_workbook(out)
    assert wb.sheetnames == ["サマリー", "投稿一覧", "取得情報・注意事項"]
    ws = wb["投稿一覧"]
    headers = [c.value for c in ws[1]]
    for required in ["本文", "投稿日時", "いいね", "リポスト", "ブックマーク", "表示回数", "URL", "ハッシュタグ"]:
        assert required in headers
    assert ws.max_row == 5
    assert ws["D2"].value == "=SUM(1)はただの本文" and ws["D2"].data_type == "s"
    assert ws["D4"].value == "制御文字入り"
    assert ws["A2"].value == datetime(2026, 11, 13, 21, 0)  # JST
    assert ws["N2"].value == "=SUM(G2:L2)"
