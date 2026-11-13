# Threads投稿エクスポートツール

Threadsのアカウントリンクを指定すると、そのアカウントの投稿一覧をExcel（.xlsx）に出力するツールです。

出力するExcelは、Chrome拡張機能「[Threads Scraper - Export Tool for Threads](https://chromewebstore.google.com/detail/threads-scraper-export-to/mninnpmemgcmbmklbhlgdehleffebilh)」（v2.5.0）の「ユーザーのスレッド（USER_THREADS）」をExcel形式で出力した場合と同じ形式です。

| 項目 | 内容 |
| --- | --- |
| ファイル名 | `T_USER_THREADS_<ユーザー名>_<件数>.xlsx` |
| シート名 | `Sheet1` |
| 1行目 | 列名（下記33列） |
| 2行目以降 | 1投稿につき1行 |

## 必要なもの

- [Node.js](https://nodejs.org/) 18以上
- Threadsのアカウント（すべての投稿を取得するにはログインが必要です）

## セットアップ（初回のみ）

```bash
cd threads-exporter
npm install
npx playwright install chromium
```

Google Chromeが入っている場合は、`npx playwright install chromium` を省略し、実行時に `--chrome` を付けてもかまいません。

## 使い方

### 1. Threadsにログインする（初回のみ）

```bash
npm run login
```

ブラウザが開くので、Threads（Instagramアカウント）でログインしてください。ログインを確認すると、ブラウザは自動で閉じます。ログイン情報は `.threads-session` フォルダに保存されるので、次回以降は不要です。

> ログインしなくても実行はできますが、Threadsの仕様上、最初の数件しか取得できません。

### 2. 投稿をExcelに出力する

```bash
npm run export -- https://www.threads.com/@ユーザー名
```

カレントフォルダに `T_USER_THREADS_ユーザー名_件数.xlsx` が作成されます。

アカウントは次のどの形式でも指定できます。

- `https://www.threads.com/@username`
- `https://www.threads.net/@username`
- `@username`
- `username`

### オプション

| オプション | 説明 |
| --- | --- |
| `--max <件数>` | 取得する投稿数の上限（省略時はすべて） |
| `--out <フォルダ>` | Excelの出力先（省略時はカレントフォルダ） |
| `--show` | ブラウザを表示したまま実行する |
| `--chrome` | インストール済みのGoogle Chromeを使う |
| `--locale <ロケール>` | `taken_at` の日時表記（省略時は `ja-JP`。例: `2026/11/13 9:05:03`） |
| `--timezone <TZ>` | `taken_at` のタイムゾーン（例: `Asia/Tokyo`。省略時はPCの設定） |
| `--session <フォルダ>` | ログイン情報の保存先（省略時は `.threads-session`） |

例:

```bash
npm run export -- https://www.threads.com/@username --max 200 --out ./output
```

## 出力される列

拡張機能と同じ33列が、同じ順序で出力されます。

| 列 | 内容 |
| --- | --- |
| id | スレッドID |
| code | 投稿コード（URL末尾の文字列） |
| thread_link | 投稿URL |
| caption | 本文 |
| image_url | 画像URL（1枚目） |
| video_url | 動画URL |
| reply_count | 返信数 |
| like_count | いいね数 |
| quote_count | 引用数 |
| repost_count | リポスト数 |
| taken_at | 投稿日時 |
| user_id | 投稿者のユーザーID |
| username | 投稿者のユーザー名 |
| full_name | 投稿者の表示名 |
| profile_pic_url | 投稿者のプロフィール画像URL |
| is_verified | 認証バッジの有無（TRUE/FALSE） |
| reply_to_username | 返信先のユーザー名 |
| reply_to_user_id | 返信先のユーザーID |
| root_username | スレッド起点のユーザー名 |
| root_user_id | スレッド起点のユーザーID |
| is_reply | 返信かどうか（TRUE/FALSE） |
| reply_code 〜 reply_username | スレッドの2件目（連続投稿の続き）の情報。投稿コード・URL・本文・画像・動画・返信数・いいね数・引用数・リポスト数・日時・ユーザーID・ユーザー名 |

拡張機能と同じ結果にするため、拡張機能の次の挙動もそのまま再現しています。

- 2件目がない投稿では、`reply_thread_link` が `https://www.threads.com/@undefined/post/undefined`、`reply_taken_at` が `Invalid Date` になり、`reply_*` の件数列は `0` になります。
- `taken_at` は、PCのタイムゾーンでの日時を文字列で出力します（ブラウザの `toLocaleString()` と同じ表記）。

## 注意事項

- Threadsの画面の仕組みが変わると、取得できなくなることがあります。
- 短時間に大量の取得を繰り返すと、Threads側で制限がかかる場合があります。ツールは数秒おきにスクロールして、少しずつ読み込みます。
- 非公開アカウントの投稿は、フォローしていないと取得できません。
- 取得したデータは、Threadsの利用規約と関係法令を守って利用してください。
