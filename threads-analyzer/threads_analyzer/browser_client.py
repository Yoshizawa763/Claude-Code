"""ブラウザ(Playwright)で公開プロフィールを開き、表示データから投稿を収集する.

- 誰のアカウントでも取得できるが、表示回数・ブックマーク数は Threads 上で
  公開されていないため取得できない（自分のアカウントは API モード推奨）。
- ログインしていないと直近 20〜30 件程度しか表示されないため、
  `--login` で一度ログインしてセッションを保存しておくこと。
"""
from __future__ import annotations

import os
import random
import time
from datetime import datetime
from pathlib import Path
from typing import Callable

from .models import FetchResult, Post
from .parser import extract_posts, extract_posts_from_html

DEFAULT_STATE = Path(".threads_session/state.json")
_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)


_SCROLL_JS = """
() => {
  const els = [document.scrollingElement, ...document.querySelectorAll('div')].filter(e =>
    e && e.scrollHeight > e.clientHeight + 50 &&
    (e === document.scrollingElement || /auto|scroll/.test(getComputedStyle(e).overflowY)));
  els.forEach(e => e.scrollBy(0, 5000));
  return els.length;
}
"""


def _launch(pw, headless: bool):
    # 既存の Chrome/Chromium を使いたい場合は THREADS_CHROMIUM_PATH に実行ファイルのパスを指定
    exe = os.environ.get("THREADS_CHROMIUM_PATH")
    kwargs = {"headless": headless}
    if exe:
        kwargs["executable_path"] = exe
    return pw.chromium.launch(**kwargs)


def login(state_path: Path = DEFAULT_STATE, log: Callable[[str], None] = print) -> None:
    """ブラウザを画面付きで開き、手動ログイン後のセッションを保存する."""
    from playwright.sync_api import sync_playwright

    state_path.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        browser = _launch(pw, headless=False)
        ctx = browser.new_context(locale="ja-JP", user_agent=_UA)
        page = ctx.new_page()
        page.goto("https://www.threads.com/login")
        log("ブラウザで Threads (Instagram アカウント) にログインしてください。")
        input("ログインが完了したら、このターミナルで Enter を押してください > ")
        ctx.storage_state(path=str(state_path))
        browser.close()
    log(f"ログイン情報を保存しました: {state_path}")


def fetch_posts_browser(
    username: str,
    since: datetime,
    state_path: Path = DEFAULT_STATE,
    headless: bool = True,
    max_scrolls: int = 400,
    log: Callable[[str], None] = print,
) -> FetchResult:
    from playwright.sync_api import sync_playwright

    notes: list[str] = []
    posts: dict[str, Post] = {}
    pending = []

    def add(found: list[Post]) -> int:
        new = 0
        for p in found:
            if p.post_id not in posts:
                new += 1
            posts[p.post_id] = p  # 後から来たデータで上書き（最新の数値）
        return new

    logged_in = state_path.exists()
    with sync_playwright() as pw:
        browser = _launch(pw, headless)
        ctx = browser.new_context(
            locale="ja-JP",
            user_agent=_UA,
            viewport={"width": 1280, "height": 900},
            storage_state=str(state_path) if logged_in else None,
        )
        page = ctx.new_page()
        page.on(
            "response",
            lambda r: pending.append(r) if "/graphql" in r.url else None,
        )

        def drain() -> int:
            new = 0
            while pending:
                resp = pending.pop(0)
                try:
                    data = resp.json()
                except Exception:
                    continue
                new += add(extract_posts(data, username))
            return new

        url = f"https://www.threads.com/@{username}"
        log(f"プロフィールを開いています: {url}")
        resp = page.goto(url, wait_until="domcontentloaded", timeout=60_000)
        if resp is not None and resp.status == 404:
            browser.close()
            raise RuntimeError(f"アカウントが見つかりません: @{username}")
        page.wait_for_timeout(4000)
        add(extract_posts_from_html(page.content(), username))
        drain()

        stalled = 0
        for i in range(max_scrolls):
            page.keyboard.press("Escape")  # ログイン促進ダイアログを閉じる
            page.evaluate(_SCROLL_JS)
            page.wait_for_timeout(int(random.uniform(1300, 2300)))
            new = drain()
            # 固定(ピン留め)投稿は古くても先頭に出るので判定から除外
            dated = [p.posted_at for p in posts.values() if not p.is_pinned]
            oldest = min(dated) if dated else None
            if new:
                stalled = 0
                log(f"  取得済み {len(posts)} 件 / 最古 {oldest:%Y-%m-%d}" if oldest else f"  取得済み {len(posts)} 件")
            else:
                stalled += 1
            if oldest and oldest < since:
                break
            if stalled >= 8:
                break
            if i and i % 40 == 0:
                time.sleep(random.uniform(3, 6))  # アクセス負荷を下げるための小休止
        browser.close()

    result = [p for p in posts.values() if p.posted_at >= since]
    dated = [p.posted_at for p in posts.values() if not p.is_pinned]
    if dated and min(dated) > since:
        msg = (
            f"{since:%Y-%m-%d} までさかのぼれませんでした（最古: {min(dated):%Y-%m-%d}）。"
        )
        if not logged_in:
            msg += " ログインしていないと表示件数が制限されます。`--login` を実行してから再取得してください。"
        notes.append(msg)
    notes.append("表示回数・ブックマーク数は Threads 上で非公開のため、ブラウザモードでは取得できません（空欄）。")
    return FetchResult(username=username, posts=result, source="browser", notes=notes)
