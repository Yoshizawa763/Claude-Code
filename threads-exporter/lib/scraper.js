'use strict';

const { chromium } = require('playwright');

const THREADS_ORIGIN = 'https://www.threads.com';

/** Gets the username from "https://www.threads.com/@name", "@name", "name", or a threads.net URL. */
function normalizeUsername(input) {
  if (!input) throw new Error('Threadsのアカウントリンク（例: https://www.threads.com/@username）を指定してください。');
  let s = String(input).trim();
  const m = s.match(/threads\.(?:com|net)\/@([^/?#\s]+)/i);
  if (m) s = m[1];
  s = s.replace(/^@/, '').replace(/[/?#].*$/, '');
  s = decodeURIComponent(s);
  if (!/^[A-Za-z0-9._]+$/.test(s)) {
    throw new Error(`アカウント名を読み取れませんでした: ${input}`);
  }
  return s;
}

async function launchContext({ sessionDir, headless, browserChannel, executablePath, locale }) {
  const opts = {
    headless,
    locale,
    viewport: { width: 1280, height: 900 },
  };
  if (browserChannel) opts.channel = browserChannel;
  if (executablePath) opts.executablePath = executablePath;
  return chromium.launchPersistentContext(sessionDir, opts);
}

async function isLoggedIn(context) {
  const cookies = await context.cookies(THREADS_ORIGIN);
  return cookies.some((c) => c.name === 'sessionid' && c.value);
}

/** Opens a visible browser and waits until the user has logged in to Threads. */
async function login(options, log = console.log) {
  const context = await launchContext({ ...options, headless: false });
  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(`${THREADS_ORIGIN}/login`, { waitUntil: 'domcontentloaded' });
    log('ブラウザでThreadsにログインしてください（最大10分待機します）...');
    const deadline = Date.now() + 10 * 60 * 1000;
    while (Date.now() < deadline) {
      if (await isLoggedIn(context)) {
        await page.waitForTimeout(3000); // let the remaining cookies settle
        log('ログインを確認しました。セッションを保存しました。');
        return true;
      }
      await page.waitForTimeout(2000);
    }
    log('タイムアウトしました。ログインを確認できませんでした。');
    return false;
  } finally {
    await context.close();
  }
}

/** Finds every object under `obj` that has a mediaData.edges list whose nodes contain thread_items. */
function findMediaData(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    for (const v of obj) findMediaData(v, out);
    return out;
  }
  const md = obj.mediaData;
  if (md && Array.isArray(md.edges) && md.edges.some((e) => e && e.node && Array.isArray(e.node.thread_items))) {
    out.push(md);
  }
  for (const k of Object.keys(obj)) findMediaData(obj[k], out);
  return out;
}

/** Parses a GraphQL response body. It can start with "for (;;);" and can hold several JSON objects, one per line. */
function parseGraphqlBody(text) {
  const cleaned = text.replace(/^for \(;;\);/, '');
  const results = [];
  try {
    results.push(JSON.parse(cleaned));
  } catch {
    for (const line of cleaned.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      try {
        results.push(JSON.parse(t));
      } catch {
        /* skip the line */
      }
    }
  }
  return results;
}

function friendlyName(request) {
  const header = request.headers()['x-fb-friendly-name'];
  if (header) return header;
  const body = request.postData() || '';
  const m = body.match(/fb_api_req_friendly_name=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : '';
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (min, max) => Math.floor(min + Math.random() * (max - min));

/**
 * Opens the profile page and collects the "Threads" tab posts: first the posts
 * embedded in the page, then the ones the page loads while scrolling.
 * Returns the raw thread nodes ({ id, thread_items }) in the order they appear.
 */
async function scrapeUserThreads(username, options, log = console.log) {
  const { maxPosts = Infinity, maxIdleScrolls = 8 } = options;
  const context = await launchContext(options);
  try {
    const loggedIn = await isLoggedIn(context);
    if (!loggedIn) {
      log('⚠ ログインしていません。Threadsの仕様により最初の数件しか取得できません。');
      log('  すべての投稿を取得するには、先に「npm run login」でログインしてください。');
    }

    const page = context.pages()[0] || (await context.newPage());

    const embedded = [];
    const fetched = []; // nodes from GraphQL pages, in arrival order
    let lastPageInfo = null;

    page.on('response', async (res) => {
      try {
        if (!res.url().includes('/graphql')) return;
        if (res.status() !== 200) return;
        const name = friendlyName(res.request());
        if (name && !/ProfileThreads/i.test(name)) return;
        const text = await res.text();
        if (!text.includes('mediaData')) return;
        for (const json of parseGraphqlBody(text)) {
          for (const md of findMediaData(json)) {
            for (const e of md.edges) if (e && e.node) fetched.push(e.node);
            if (md.page_info) lastPageInfo = md.page_info;
          }
        }
      } catch {
        /* ignore the response, e.g. the page navigated away */
      }
    });

    const url = `${THREADS_ORIGIN}/@${encodeURIComponent(username)}`;
    log(`プロフィールを開いています: ${url}`);
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (resp && resp.status() === 404) throw new Error(`アカウントが見つかりません: @${username}`);
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    // Posts embedded in the page's HTML (the first page).
    const scripts = await page.$$eval('script[type="application/json"]', (els) =>
      els.map((el) => el.textContent || '').filter((t) => t.includes('mediaData') && t.includes('thread_items')),
    );
    for (const s of scripts) {
      let json;
      try {
        json = JSON.parse(s);
      } catch {
        continue;
      }
      const mds = findMediaData(json);
      if (mds.length > 0) {
        for (const e of mds[0].edges) if (e && e.node) embedded.push(e.node);
        if (mds[0].page_info && !lastPageInfo) lastPageInfo = mds[0].page_info;
        break;
      }
    }

    const collectAll = () => {
      const seen = new Set();
      const nodes = [];
      for (const n of [...embedded, ...fetched]) {
        const key = n.id || n.thread_items?.[0]?.post?.pk || n.thread_items?.[0]?.post?.code;
        if (seen.has(key)) continue;
        seen.add(key);
        nodes.push(n);
      }
      return nodes;
    };

    let count = collectAll().length;
    log(`取得済み: ${count}件`);

    let idle = 0;
    while (count < maxPosts) {
      if (lastPageInfo && lastPageInfo.has_next_page === false) break;
      if (!loggedIn && idle >= 2) break;

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.mouse.wheel(0, 3000).catch(() => {});
      await sleep(rand(2000, 4000));

      const now = collectAll().length;
      if (now > count) {
        count = now;
        idle = 0;
        log(`取得済み: ${count}件`);
      } else {
        idle += 1;
        if (idle >= maxIdleScrolls) break;
        // Scroll up a little and back down to trigger loading again.
        await page.mouse.wheel(0, -1500).catch(() => {});
        await sleep(rand(800, 1500));
      }
    }

    let nodes = collectAll();
    if (Number.isFinite(maxPosts)) nodes = nodes.slice(0, maxPosts);
    return { nodes, loggedIn };
  } finally {
    await context.close();
  }
}

module.exports = {
  normalizeUsername,
  login,
  scrapeUserThreads,
  findMediaData,
  parseGraphqlBody,
};
