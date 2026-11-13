"""収集した投稿を分析用 Excel に書き出す."""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, tzinfo
from pathlib import Path

from openpyxl import Workbook
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
from openpyxl.chart import BarChart, Reference
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

from .models import FetchResult, Post

FONT_NAME = "Meiryo UI"
HEADER_FILL = PatternFill("solid", fgColor="1F2937")
SUB_FILL = PatternFill("solid", fgColor="E5E7EB")
THIN = Side(style="thin", color="D1D5DB")
BORDER = Border(left=THIN, right=THIN, top=THIN, bottom=THIN)
INT_FMT = "#,##0"
DEC_FMT = "#,##0.0"
PCT_FMT = "0.00%"
DATE_FMT = "yyyy/mm/dd hh:mm"
WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"]

POSTS_SHEET = "投稿一覧"
# (見出し, 列幅)
COLUMNS = [
    ("投稿日時", 17),       # A
    ("曜日", 6),            # B
    ("時台", 6),            # C
    ("本文", 60),           # D
    ("文字数", 8),          # E
    ("ハッシュタグ", 22),   # F
    ("いいね", 9),          # G
    ("返信", 8),            # H
    ("リポスト", 9),        # I
    ("引用", 8),            # J
    ("シェア", 8),          # K
    ("ブックマーク", 11),   # L
    ("表示回数", 11),       # M
    ("エンゲージメント合計", 13),  # N
    ("エンゲージメント率", 12),    # O
    ("メディア", 10),       # P
    ("URL", 48),            # Q
]
COL = {name: get_column_letter(i + 1) for i, (name, _) in enumerate(COLUMNS)}


def _font(**kw) -> Font:
    return Font(name=FONT_NAME, **kw)


def _clean(text: str) -> str:
    return ILLEGAL_CHARACTERS_RE.sub("", text or "")


def _set_text(cell, text: str) -> None:
    """'=' などで始まる本文が数式と解釈されないよう文字列として書き込む."""
    cell.value = _clean(text)
    cell.data_type = "s"


def _header(ws: Worksheet, row: int, labels: list[str], col: int = 1) -> None:
    for i, label in enumerate(labels):
        c = ws.cell(row=row, column=col + i, value=label)
        c.font = _font(bold=True, color="FFFFFF")
        c.fill = HEADER_FILL
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = BORDER


def _section(ws: Worksheet, row: int, title: str) -> None:
    c = ws.cell(row=row, column=1, value=title)
    c.font = _font(bold=True, size=12, color="1F2937")


def _local(dt: datetime, tz: tzinfo) -> datetime:
    return dt.astimezone(tz).replace(tzinfo=None)


def _engagement(p: Post) -> int:
    return sum(v or 0 for v in (p.likes, p.replies, p.reposts, p.quotes, p.shares, p.bookmarks))


def write_excel(result: FetchResult, path: Path, since: datetime, until: datetime, tz: tzinfo) -> Path:
    posts = sorted(result.posts, key=lambda p: p.posted_at, reverse=True)
    wb = Workbook()
    summary = wb.active
    summary.title = "サマリー"
    ws = wb.create_sheet(POSTS_SHEET)
    notes_ws = wb.create_sheet("取得情報・注意事項")

    last = _write_posts(ws, posts, tz)
    _write_summary(summary, result, posts, last, since, until, tz)
    _write_notes(notes_ws, result, since, until, tz)

    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)
    return path


def _write_posts(ws: Worksheet, posts: list[Post], tz: tzinfo) -> int:
    _header(ws, 1, [c[0] for c in COLUMNS])
    ws.row_dimensions[1].height = 30
    for i, (_, width) in enumerate(COLUMNS):
        ws.column_dimensions[get_column_letter(i + 1)].width = width

    for r, p in enumerate(posts, start=2):
        a = f"{COL['投稿日時']}{r}"
        ws[a] = _local(p.posted_at, tz)
        ws[a].number_format = DATE_FMT
        ws[f"B{r}"] = f'=CHOOSE(WEEKDAY({a},2),"月","火","水","木","金","土","日")'
        ws[f"C{r}"] = f"=HOUR({a})"
        _set_text(ws[f"D{r}"], p.text)
        ws[f"E{r}"] = f"=LEN(D{r})"
        _set_text(ws[f"F{r}"], " ".join(f"#{t}" for t in p.hashtags))
        for col, val in (
            ("いいね", p.likes), ("返信", p.replies), ("リポスト", p.reposts),
            ("引用", p.quotes), ("シェア", p.shares), ("ブックマーク", p.bookmarks),
            ("表示回数", p.views),
        ):
            cell = ws[f"{COL[col]}{r}"]
            cell.value = val
            cell.number_format = INT_FMT
        ws[f"N{r}"] = f"=SUM(G{r}:L{r})"
        ws[f"N{r}"].number_format = INT_FMT
        ws[f"O{r}"] = f'=IF(N(M{r})>0,N{r}/M{r},"")'
        ws[f"O{r}"].number_format = PCT_FMT
        ws[f"P{r}"] = p.media_type
        if p.url:
            ws[f"Q{r}"] = p.url
            ws[f"Q{r}"].hyperlink = p.url
            ws[f"Q{r}"].font = _font(color="2563EB", underline="single")

        for c in range(1, len(COLUMNS) + 1):
            cell = ws.cell(row=r, column=c)
            if c != 17:
                cell.font = _font()
            cell.border = BORDER
            cell.alignment = Alignment(
                vertical="top", wrap_text=(c in (4, 6)),
                horizontal="center" if c in (2, 3) else None,
            )

    last = max(len(posts) + 1, 2)
    ws.freeze_panes = "B2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(COLUMNS))}{last}"
    return last


def _rng(col: str, last: int) -> str:
    return f"'{POSTS_SHEET}'!${col}$2:${col}${last}"


def _write_summary(ws: Worksheet, result: FetchResult, posts: list[Post], last: int,
                   since: datetime, until: datetime, tz: tzinfo) -> None:
    ws.column_dimensions["A"].width = 22
    for col in "BCDEFG":
        ws.column_dimensions[col].width = 15
    ws.column_dimensions["H"].width = 50

    ws["A1"] = f"Threads 投稿分析レポート  @{result.username}"
    ws["A1"].font = _font(bold=True, size=16)
    info = [
        ("対象期間", f"{_local(since, tz):%Y/%m/%d} 〜 {_local(until, tz):%Y/%m/%d}"),
        ("取得方法", "公式API（自分のアカウント）" if result.source == "api" else "ブラウザ（公開プロフィール）"),
        ("取得日時", f"{_local(until, tz):%Y/%m/%d %H:%M}"),
    ]
    for i, (k, v) in enumerate(info, start=3):
        ws.cell(row=i, column=1, value=k).font = _font(bold=True)
        ws.cell(row=i, column=2, value=v).font = _font()

    # --- 全体 KPI ---
    row = 7
    _section(ws, row, "■ 全体サマリー")
    row += 1
    _header(ws, row, ["指標", "合計", "平均 / 投稿", "最大"])
    ws.cell(row=row + 1, column=1, value="投稿数").font = _font()
    c = ws.cell(row=row + 1, column=2, value=f"=COUNT({_rng('A', last)})")
    c.number_format = INT_FMT
    c.font = _font(bold=True)
    for col in "BCD":
        ws[f"{col}{row + 1}"].border = BORDER
    ws[f"A{row + 1}"].border = BORDER
    r = row + 2
    for label, col in (("いいね", "G"), ("返信", "H"), ("リポスト", "I"), ("引用", "J"),
                       ("シェア", "K"), ("ブックマーク", "L"), ("表示回数", "M"),
                       ("エンゲージメント合計", "N")):
        rng = _rng(col, last)
        ws.cell(row=r, column=1, value=label)
        ws.cell(row=r, column=2, value=f'=IF(COUNT({rng})=0,"-",SUM({rng}))').number_format = INT_FMT
        ws.cell(row=r, column=3, value=f'=IFERROR(AVERAGE({rng}),"-")').number_format = DEC_FMT
        ws.cell(row=r, column=4, value=f'=IF(COUNT({rng})=0,"-",MAX({rng}))').number_format = INT_FMT
        for c in range(1, 5):
            ws.cell(row=r, column=c).font = _font()
            ws.cell(row=r, column=c).border = BORDER
            if c > 1:
                ws.cell(row=r, column=c).alignment = Alignment(horizontal="right")
        r += 1
    ws.cell(row=r, column=1, value="平均エンゲージメント率").font = _font()
    c = ws.cell(row=r, column=3, value=f'=IFERROR(AVERAGE({_rng("O", last)}),"-")')
    c.number_format = PCT_FMT
    c.alignment = Alignment(horizontal="right")
    for cc in range(1, 5):
        ws.cell(row=r, column=cc).border = BORDER
        ws.cell(row=r, column=cc).font = _font()
    ws.cell(row=r, column=5, value="※エンゲージメント率 = エンゲージメント合計 ÷ 表示回数（表示回数がある投稿のみ）").font = _font(size=9, color="6B7280")

    # --- 曜日別 ---
    row = r + 3
    _section(ws, row, "■ 曜日別パフォーマンス（いつ投稿すると伸びるか）")
    row += 1
    weekday_header_row = row
    _header(ws, row, ["曜日", "投稿数", "平均いいね", "平均エンゲージメント", "平均表示回数"])
    for i, wd in enumerate(WEEKDAYS):
        rr = row + 1 + i
        ws.cell(row=rr, column=1, value=wd)
        _avg_row(ws, rr, f'A{rr}', "B", last)
    weekday_last = row + len(WEEKDAYS)
    _add_bar_chart(ws, "曜日別 平均エンゲージメント", weekday_header_row, weekday_last, "H" + str(weekday_header_row - 1))

    # --- 時間帯別 ---
    row = weekday_last + 3
    _section(ws, row, "■ 時間帯別パフォーマンス")
    row += 1
    hour_header_row = row
    _header(ws, row, ["時台", "投稿数", "平均いいね", "平均エンゲージメント", "平均表示回数"])
    for h in range(24):
        rr = row + 1 + h
        ws.cell(row=rr, column=1, value=h)
        _avg_row(ws, rr, f"A{rr}", "C", last)
    hour_last = row + 24
    _add_bar_chart(ws, "時間帯別 平均エンゲージメント", hour_header_row, hour_last, "H" + str(hour_header_row))

    # --- 月別 ---
    row = hour_last + 3
    _section(ws, row, "■ 月別推移")
    row += 1
    _header(ws, row, ["月", "投稿数", "合計いいね", "合計エンゲージメント", "平均エンゲージメント"])
    months = []
    cur = _local(since, tz).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = _local(until, tz)
    while cur <= end:
        months.append(cur)
        cur = (cur + timedelta(days=32)).replace(day=1)
    a, g, n = _rng("A", last), _rng("G", last), _rng("N", last)
    for i, m in enumerate(months):
        rr = row + 1 + i
        nxt = (m + timedelta(days=32)).replace(day=1)
        cond = f'{a},">="&DATE({m.year},{m.month},1),{a},"<"&DATE({nxt.year},{nxt.month},1)'
        ws.cell(row=rr, column=1, value=f"{m:%Y年%m月}")
        ws.cell(row=rr, column=2, value=f"=COUNTIFS({cond})").number_format = INT_FMT
        ws.cell(row=rr, column=3, value=f"=SUMIFS({g},{cond})").number_format = INT_FMT
        ws.cell(row=rr, column=4, value=f"=SUMIFS({n},{cond})").number_format = INT_FMT
        ws.cell(row=rr, column=5, value=f'=IFERROR(AVERAGEIFS({n},{cond}),"-")').number_format = DEC_FMT
        _style_row(ws, rr, 5)

    # --- 上位投稿 ---
    row = row + len(months) + 3
    _section(ws, row, "■ エンゲージメント上位 10 投稿（取得時点の値）")
    row += 1
    _header(ws, row, ["投稿日時", "いいね", "返信", "リポスト", "表示回数", "エンゲージメント合計", "", "本文（冒頭）"])
    top = sorted(posts, key=_engagement, reverse=True)[:10]
    for i, p in enumerate(top):
        rr = row + 1 + i
        ws.cell(row=rr, column=1, value=_local(p.posted_at, tz)).number_format = DATE_FMT
        for j, v in enumerate((p.likes, p.replies, p.reposts, p.views, _engagement(p)), start=2):
            ws.cell(row=rr, column=j, value=v).number_format = INT_FMT
        c = ws.cell(row=rr, column=8)
        _set_text(c, (p.text or "").replace("\n", " ")[:80])
        if p.url:
            c.hyperlink = p.url
        _style_row(ws, rr, 8)

    # --- ハッシュタグ ---
    row = row + max(len(top), 1) + 3
    _section(ws, row, "■ ハッシュタグ / トピックタグ ランキング（取得時点の値）")
    row += 1
    _header(ws, row, ["ハッシュタグ", "使用回数", "平均いいね", "平均エンゲージメント"])
    stats: dict[str, list[Post]] = defaultdict(list)
    display: dict[str, str] = {}
    for p in posts:
        for t in p.hashtags:
            stats[t.lower()].append(p)
            display.setdefault(t.lower(), t)
    ranking = sorted(stats.items(), key=lambda kv: (-len(kv[1]), -sum(map(_engagement, kv[1]))))[:30]
    if not ranking:
        ws.cell(row=row + 1, column=1, value="（ハッシュタグ付きの投稿はありませんでした）").font = _font(color="6B7280")
    for i, (key, ps) in enumerate(ranking):
        rr = row + 1 + i
        _set_text(ws.cell(row=rr, column=1), f"#{display[key]}")
        ws.cell(row=rr, column=2, value=len(ps)).number_format = INT_FMT
        likes = [p.likes for p in ps if p.likes is not None]
        ws.cell(row=rr, column=3, value=round(sum(likes) / len(likes), 1) if likes else None).number_format = DEC_FMT
        ws.cell(row=rr, column=4, value=round(sum(map(_engagement, ps)) / len(ps), 1)).number_format = DEC_FMT
        _style_row(ws, rr, 4)


def _avg_row(ws: Worksheet, rr: int, key_cell: str, key_col: str, last: int) -> None:
    key = _rng(key_col, last)
    ws.cell(row=rr, column=2, value=f"=COUNTIF({key},{key_cell})").number_format = INT_FMT
    for c, col in ((3, "G"), (4, "N"), (5, "M")):
        ws.cell(row=rr, column=c, value=f'=IFERROR(AVERAGEIF({key},{key_cell},{_rng(col, last)}),"-")').number_format = DEC_FMT
    _style_row(ws, rr, 5)


def _style_row(ws: Worksheet, rr: int, ncols: int) -> None:
    for c in range(1, ncols + 1):
        cell = ws.cell(row=rr, column=c)
        if not (cell.hyperlink):
            cell.font = _font()
        else:
            cell.font = _font(color="2563EB", underline="single")
        cell.border = BORDER
        if c == 1:
            cell.alignment = Alignment(horizontal="center")
        elif isinstance(cell.value, (int, float)) or str(cell.value or "").startswith("="):
            cell.alignment = Alignment(horizontal="right")


def _add_bar_chart(ws: Worksheet, title: str, header_row: int, last_row: int, anchor: str) -> None:
    chart = BarChart()
    chart.type = "col"
    chart.title = title
    chart.style = 10
    chart.height = 7
    chart.width = 16
    data = Reference(ws, min_col=4, min_row=header_row, max_row=last_row)
    cats = Reference(ws, min_col=1, min_row=header_row + 1, max_row=last_row)
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(cats)
    chart.legend = None
    chart.roundedCorners = False
    chart.x_axis.delete = False
    chart.y_axis.delete = False
    ws.add_chart(chart, anchor)


def _write_notes(ws: Worksheet, result: FetchResult, since: datetime, until: datetime, tz: tzinfo) -> None:
    ws.column_dimensions["A"].width = 24
    ws.column_dimensions["B"].width = 100
    ws["A1"] = "取得情報・注意事項"
    ws["A1"].font = _font(bold=True, size=14)
    rows = [
        ("アカウント", f"@{result.username}"),
        ("取得件数", f"{len(result.posts)} 件"),
        ("対象期間", f"{_local(since, tz):%Y/%m/%d %H:%M} 〜 {_local(until, tz):%Y/%m/%d %H:%M}"),
        ("取得方法", result.source),
    ]
    rows += [("注意", n) for n in result.notes]
    rows += [
        ("", ""),
        ("列の定義", ""),
        ("いいね / 返信 / リポスト / 引用 / シェア", "取得時点の値。返信は直接の返信数。"),
        ("ブックマーク", "保存数。Threads では投稿者本人にしか見えず、公式 API にも無いため通常は空欄。"),
        ("表示回数", "公式 API モード（自分のアカウント）でのみ取得。"),
        ("エンゲージメント合計", "いいね + 返信 + リポスト + 引用 + シェア + ブックマーク"),
        ("エンゲージメント率", "エンゲージメント合計 ÷ 表示回数"),
        ("ハッシュタグ", "本文中の #タグ と Threads のトピックタグ"),
        ("投稿日時", "指定タイムゾーン（既定: 日本時間）"),
    ]
    for i, (k, v) in enumerate(rows, start=3):
        ws.cell(row=i, column=1, value=k).font = _font(bold=bool(k))
        c = ws.cell(row=i, column=2)
        _set_text(c, v)
        c.font = _font()
        c.alignment = Alignment(wrap_text=True, vertical="top")
