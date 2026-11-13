#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { normalizeUsername, login, scrapeUserThreads } = require('./lib/scraper');
const { mapThreadNodes } = require('./lib/mapping');
const { writeExcel } = require('./lib/excel');

const HELP = `
Threads投稿エクスポートツール

使い方:
  node threads-export.js --login                 Threadsにログイン（初回のみ）
  node threads-export.js <アカウントリンク> [オプション]

例:
  node threads-export.js https://www.threads.com/@username
  node threads-export.js @username --max 100 --out ./output

オプション:
  --max <件数>          取得する投稿数の上限（省略時: すべて）
  --out <フォルダ>      Excelの出力先（省略時: カレントフォルダ）
  --show               ブラウザを表示して実行する
  --chrome             インストール済みのGoogle Chromeを使う
  --locale <ロケール>   taken_at の日時表記（省略時: ja-JP）
  --timezone <TZ>       taken_at のタイムゾーン（例: Asia/Tokyo、省略時: PCの設定）
  --session <フォルダ>  ログイン情報の保存先（省略時: ./.threads-session）
  -h, --help           このヘルプを表示
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} に値を指定してください。`);
      return v;
    };
    switch (a) {
      case '-h':
      case '--help': args.help = true; break;
      case '--login': args.login = true; break;
      case '--show': args.show = true; break;
      case '--chrome': args.chrome = true; break;
      case '--max': args.max = parseInt(next(), 10); break;
      case '--out': args.out = next(); break;
      case '--locale': args.locale = next(); break;
      case '--timezone': args.timezone = next(); break;
      case '--session': args.session = next(); break;
      default:
        if (a.startsWith('--')) throw new Error(`不明なオプションです: ${a}`);
        args._.push(a);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.login && args._.length === 0)) {
    console.log(HELP);
    return;
  }

  const browserOptions = {
    sessionDir: path.resolve(args.session || path.join(__dirname, '.threads-session')),
    headless: !args.show,
    browserChannel: args.chrome ? 'chrome' : undefined,
    executablePath: process.env.THREADS_EXPORT_BROWSER_PATH || undefined,
    locale: args.locale || 'ja-JP',
  };

  if (args.login) {
    const ok = await login(browserOptions);
    process.exitCode = ok ? 0 : 1;
    return;
  }

  const username = normalizeUsername(args._[0]);
  if (args.max !== undefined && (!Number.isFinite(args.max) || args.max <= 0)) {
    throw new Error('--max には1以上の数値を指定してください。');
  }
  const outDir = path.resolve(args.out || '.');
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`対象アカウント: @${username}`);
  const { nodes } = await scrapeUserThreads(username, {
    ...browserOptions,
    maxPosts: args.max ?? Infinity,
  });

  const rows = mapThreadNodes(nodes, { locale: browserOptions.locale, timeZone: args.timezone });
  if (rows.length === 0) {
    console.log('投稿を取得できませんでした（非公開アカウント、投稿なし、またはログインが必要な可能性があります）。');
    process.exitCode = 1;
    return;
  }
  const file = writeExcel(rows, username, outDir);
  console.log(`完了: ${rows.length}件の投稿を出力しました → ${file}`);
}

main().catch((err) => {
  console.error(`エラー: ${err.message}`);
  process.exitCode = 1;
});
