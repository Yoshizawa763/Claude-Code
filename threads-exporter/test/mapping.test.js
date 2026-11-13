'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const XLSX = require('xlsx');

const { mapThreadNodes } = require('../lib/mapping');
const { writeExcel, exportFileName } = require('../lib/excel');
const { normalizeUsername, findMediaData, parseGraphqlBody } = require('../lib/scraper');

const COLUMNS = [
  'id', 'code', 'thread_link', 'caption', 'image_url', 'video_url', 'reply_count', 'like_count',
  'quote_count', 'repost_count', 'taken_at', 'user_id', 'username', 'full_name', 'profile_pic_url',
  'is_verified', 'reply_to_username', 'reply_to_user_id', 'root_username', 'root_user_id', 'is_reply',
  'reply_code', 'reply_thread_link', 'reply_caption', 'reply_image_url', 'reply_video_url',
  'reply_reply_count', 'reply_like_count', 'reply_quote_count', 'reply_repost_count', 'reply_taken_at',
  'reply_user_id', 'reply_username',
];

const user = { pk: '111', username: 'alice', full_name: 'Alice', profile_pic_url: 'https://p/pic.jpg', is_verified: true };

const single = {
  id: '9001',
  thread_items: [
    {
      post: {
        code: 'ABC',
        caption: { text: 'hello' },
        like_count: 5,
        taken_at: 1700000000,
        user,
        image_versions2: { candidates: [{ url: 'https://img/1.jpg' }] },
        video_versions: null,
        text_post_app_info: { direct_reply_count: 2, quote_count: 1, repost_count: 3, is_reply: false, reply_to_author: null, root_post_author: null },
      },
    },
  ],
};

const selfThread = {
  id: '9002',
  thread_items: [
    {
      post: {
        code: 'DEF',
        caption: null,
        like_count: 0,
        taken_at: 1700000100,
        user,
        image_versions2: { candidates: [{ url: 'https://img/null.jpg' }] },
        video_versions: [{ url: 'https://vid/1.mp4' }],
        text_post_app_info: { direct_reply_count: 0, quote_count: 0, repost_count: 0 },
      },
    },
    {
      post: {
        code: 'GHI',
        caption: { text: 'second' },
        like_count: 7,
        taken_at: 1700000200,
        user,
        image_versions2: { candidates: [] },
        text_post_app_info: { direct_reply_count: 4, quote_count: 0, repost_count: 1 },
      },
    },
  ],
};

test('rows have the same keys, in the same order, as the extension', () => {
  const rows = mapThreadNodes([single, selfThread, { id: 'x', thread_items: [] }], { timeZone: 'Asia/Tokyo' });
  assert.strictEqual(rows.length, 2);
  for (const r of rows) assert.deepStrictEqual(Object.keys(r), COLUMNS);
});

test('a single post maps to the expected values, with the extension quirks', () => {
  const [r] = mapThreadNodes([single], { timeZone: 'Asia/Tokyo' });
  assert.strictEqual(r.thread_link, 'https://www.threads.com/@alice/post/ABC');
  assert.strictEqual(r.caption, 'hello');
  assert.strictEqual(r.image_url, 'https://img/1.jpg');
  assert.strictEqual(r.video_url, '');
  assert.strictEqual(r.reply_count, 2);
  assert.strictEqual(r.taken_at, '2023/11/15 7:13:20');
  assert.strictEqual(r.is_verified, true);
  assert.strictEqual(r.is_reply, false);
  assert.strictEqual(r.reply_code, undefined);
  assert.strictEqual(r.reply_thread_link, 'https://www.threads.com/@undefined/post/undefined');
  assert.strictEqual(r.reply_taken_at, 'Invalid Date');
  assert.strictEqual(r.reply_like_count, 0);
});

test('a self-thread fills the reply_* columns from the second item', () => {
  const [r] = mapThreadNodes([selfThread], { timeZone: 'Asia/Tokyo' });
  assert.strictEqual(r.caption, '');
  assert.strictEqual(r.image_url, ''); // null.jpg is dropped
  assert.strictEqual(r.video_url, 'https://vid/1.mp4');
  assert.strictEqual(r.reply_code, 'GHI');
  assert.strictEqual(r.reply_thread_link, 'https://www.threads.com/@alice/post/GHI');
  assert.strictEqual(r.reply_caption, 'second');
  assert.strictEqual(r.reply_reply_count, 4);
  assert.strictEqual(r.reply_like_count, 7);
  assert.strictEqual(r.reply_repost_count, 1);
  assert.strictEqual(r.reply_user_id, '111');
  assert.strictEqual(r.reply_username, 'alice');
});

test('the Excel file has the extension name, sheet name and headers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'threads-export-'));
  const rows = mapThreadNodes([single, selfThread], { timeZone: 'Asia/Tokyo' });
  const file = writeExcel(rows, 'alice', dir);
  assert.strictEqual(path.basename(file), 'T_USER_THREADS_alice_2.xlsx');
  assert.strictEqual(exportFileName('bob', 10), 'T_USER_THREADS_bob_10.xlsx');

  const wb = XLSX.readFile(file);
  assert.deepStrictEqual(wb.SheetNames, ['Sheet1']);
  const aoa = XLSX.utils.sheet_to_json(wb.Sheets.Sheet1, { header: 1 });
  assert.deepStrictEqual(aoa[0], COLUMNS);
  assert.strictEqual(aoa.length, 3);
  const ws = wb.Sheets.Sheet1;
  assert.strictEqual(ws.G2.t, 'n'); // reply_count is stored as a number
  assert.strictEqual(ws.P2.t, 'b'); // is_verified is stored as a boolean
  fs.rmSync(dir, { recursive: true, force: true });
});

test('normalizeUsername accepts several input forms', () => {
  assert.strictEqual(normalizeUsername('https://www.threads.com/@zuck'), 'zuck');
  assert.strictEqual(normalizeUsername('https://www.threads.net/@some.user_1?xmt=abc'), 'some.user_1');
  assert.strictEqual(normalizeUsername('https://www.threads.com/@zuck/post/ABC'), 'zuck');
  assert.strictEqual(normalizeUsername('@zuck'), 'zuck');
  assert.strictEqual(normalizeUsername('zuck'), 'zuck');
  assert.throws(() => normalizeUsername('https://example.com/'));
});

test('GraphQL pagination responses are parsed', () => {
  const page = { data: { mediaData: { edges: [{ node: single }], page_info: { has_next_page: true, end_cursor: 'c' } } } };
  const body = `for (;;);${JSON.stringify(page)}\n${JSON.stringify({ extensions: { is_final: true } })}`;
  const jsons = parseGraphqlBody(body);
  assert.strictEqual(jsons.length, 2);
  const mds = jsons.flatMap((j) => findMediaData(j));
  assert.strictEqual(mds.length, 1);
  assert.strictEqual(mds[0].edges[0].node.id, '9001');
});
