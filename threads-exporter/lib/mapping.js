'use strict';

/**
 * Converts Threads API thread nodes into export rows.
 *
 * This mirrors how the "Threads Scraper - Export Tool for Threads" Chrome
 * extension (v2.5.0) turns its "USER_THREADS" data into rows: the same keys,
 * in the same order, with the same values. Some odd values are kept on purpose
 * so the output matches (see below).
 *
 * - A post with no second thread item gets
 *   reply_thread_link = "https://www.threads.com/@undefined/post/undefined"
 *   and reply_taken_at = "Invalid Date".
 * - A key whose value is undefined still gets a header, but its cell stays empty.
 */

/** Same format as the browser's Date#toLocaleString(); ja-JP gives e.g. "2026/11/13 9:05:03". */
function makeDateFormatter(locale, timeZone) {
  const opts = timeZone ? { timeZone } : undefined;
  return (date) => date.toLocaleString(locale, opts);
}

function mapThreadNodes(nodes, { locale = 'ja-JP', timeZone } = {}) {
  const fmt = makeDateFormatter(locale, timeZone);

  return nodes
    .map((e) => {
      if (!e || !Array.isArray(e.thread_items) || e.thread_items.length === 0) return null;

      const {
        post: {
          code: n,
          caption: r,
          like_count: a,
          text_post_app_info: i,
          taken_at: o,
          user: { pk: l, username: u, full_name: s = '', profile_pic_url: c, is_verified: f },
          image_versions2: d,
          video_versions: v,
        },
      } = e.thread_items[0];

      let p = '';
      if (d && d.candidates && d.candidates.length > 0) p = d.candidates[0].url;
      if (p.includes('null.jpg')) p = '';

      let h = '';
      if (v && v.length > 0) h = v[0].url;

      const {
        direct_reply_count: m,
        quote_count: y,
        repost_count: x,
        is_reply: b = false,
        reply_to_author: w,
        root_post_author: T,
      } = i || {};

      const S = r?.text || '';
      const _ = `https://www.threads.com/@${u}/post/${n}`;
      const A = e.thread_items?.[1]?.post;

      let E = A?.image_versions2?.candidates?.[0]?.url || '';
      if (E.includes('null.jpg')) E = '';
      const k = A?.video_versions?.[0]?.url || '';

      return {
        id: e.id,
        code: n,
        thread_link: _,
        caption: S,
        image_url: p,
        video_url: h,
        reply_count: m,
        like_count: a,
        quote_count: y,
        repost_count: x,
        taken_at: fmt(new Date(o * 1e3)),
        user_id: l,
        username: u,
        full_name: s,
        profile_pic_url: c,
        is_verified: f,
        reply_to_username: w?.username || '',
        reply_to_user_id: w?.id || '',
        root_username: T?.username || '',
        root_user_id: T?.pk || T?.id || '',
        is_reply: !!b,
        reply_code: A?.code,
        reply_thread_link: `https://www.threads.com/@${A?.user?.username}/post/${A?.code}`,
        reply_caption: A?.caption?.text,
        reply_image_url: E,
        reply_video_url: k,
        reply_reply_count: A?.text_post_app_info?.direct_reply_count || 0,
        reply_like_count: A?.like_count || 0,
        reply_quote_count: A?.text_post_app_info?.quote_count || 0,
        reply_repost_count: A?.text_post_app_info?.repost_count || 0,
        reply_taken_at: fmt(new Date(A?.taken_at * 1e3)) || '',
        reply_user_id: A?.user?.pk,
        reply_username: A?.user?.username,
      };
    })
    .filter((row) => row !== null);
}

module.exports = { mapThreadNodes };
