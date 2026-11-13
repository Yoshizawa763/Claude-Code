from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

from .browser_client import DEFAULT_STATE, fetch_posts_browser, login
from .excel_writer import write_excel
from .utils import parse_username


def months_ago(now: datetime, months: int) -> datetime:
    y, m = now.year, now.month - months
    while m <= 0:
        m += 12
        y -= 1
    day = min(now.day, [31, 29 if y % 4 == 0 and (y % 100 or y % 400 == 0) else 28,
                        31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1])
    return now.replace(year=y, month=m, day=day)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="threads_export",
        description="Threads アカウントの直近の投稿を集めて Excel に出力します。",
    )
    p.add_argument("account", nargs="?", help="アカウント URL（例: https://www.threads.com/@username）または @username")
    p.add_argument("-o", "--output", help="出力ファイル名（既定: output/threads_<username>_<日付>.xlsx）")
    p.add_argument("--months", type=int, default=6, help="何か月分さかのぼるか（既定: 6）")
    p.add_argument("--mode", choices=["auto", "api", "browser"], default="auto",
                   help="auto: トークンが自分のアカウントなら API、それ以外はブラウザ（既定）")
    p.add_argument("--token", default=os.environ.get("THREADS_ACCESS_TOKEN"),
                   help="Threads API アクセストークン（環境変数 THREADS_ACCESS_TOKEN でも可）")
    p.add_argument("--login", action="store_true", help="ブラウザでログインしてセッションを保存する")
    p.add_argument("--session", default=str(DEFAULT_STATE), help="ログインセッションの保存先")
    p.add_argument("--show-browser", action="store_true", help="取得中のブラウザ画面を表示する")
    p.add_argument("--tz", default="Asia/Tokyo", help="出力する日時のタイムゾーン（既定: Asia/Tokyo）")
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    session = Path(args.session)

    if args.login:
        login(session)
        if not args.account:
            return 0

    account = args.account or input("Threads のアカウント URL を入力してください > ").strip()
    try:
        username = parse_username(account)
    except ValueError as e:
        print(e, file=sys.stderr)
        return 2

    tz = ZoneInfo(args.tz)
    until = datetime.now(timezone.utc)
    since = months_ago(until, args.months)
    print(f"@{username} の {since.astimezone(tz):%Y/%m/%d} 以降の投稿を取得します。")

    result = None
    mode = args.mode
    if mode in ("auto", "api"):
        if not args.token:
            if mode == "api":
                print("API モードにはアクセストークンが必要です（--token または THREADS_ACCESS_TOKEN）。", file=sys.stderr)
                return 2
        else:
            from .api_client import ThreadsAPIError, fetch_posts_api
            try:
                result = fetch_posts_api(args.token, since, expected_username=username)
            except ThreadsAPIError as e:
                if mode == "api":
                    print(e, file=sys.stderr)
                    return 1
                print(f"[API 利用不可] {e}\n→ ブラウザモードで取得します。")

    if result is None:
        try:
            result = fetch_posts_browser(
                username, since, state_path=session, headless=not args.show_browser,
            )
        except RuntimeError as e:
            print(e, file=sys.stderr)
            return 1

    out = Path(args.output) if args.output else Path("output") / f"threads_{username}_{until.astimezone(tz):%Y%m%d}.xlsx"
    write_excel(result, out, since, until, tz)
    print(f"\n{len(result.posts)} 件の投稿を出力しました → {out.resolve()}")
    for n in result.notes:
        print(f"  ※ {n}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
