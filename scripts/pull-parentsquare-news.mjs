import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { chromium } from 'playwright';

const FEED_URL = 'https://www.parentsquare.com/schools/5547/feeds';
const NEWS_PATH = path.resolve('src/data/news.json');
const SESSION_DIR = path.resolve('.parentsquare-auto-session');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MAX_NEW_POSTS = 10;
const MAX_TOTAL_POSTS = 20;
const SHOULD_PUBLISH = process.argv.includes('--publish');

function fail(message) {
  throw new Error(message);
}

function cleanText(value) {
  return String(value || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return cleanText(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function paragraphHtml(text) {
  const cleaned = cleanText(text);
  return cleaned ? `<p>${escapeHtml(cleaned)}</p>` : '';
}

function summarize(text) {
  const cleaned = cleanText(text);
  return cleaned.length <= 180 ? cleaned : `${cleaned.slice(0, 177).trim()}...`;
}

function postIdFromUrl(url) {
  return String(url || '').match(/\/feeds\/(\d+)/)?.[1] || '';
}

function monthNumber(month) {
  return {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  }[String(month || '').toLowerCase().slice(0, 3)] || 0;
}

function normalizeDate(value) {
  const text = cleanText(value);
  const iso = text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];

  const named = text.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?(?:\s+at\b.*)?(?:\s+(20\d{2}))?/i)
    || text.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s*(20\d{2})?/i);
  if (named) {
    const month = monthNumber(named[1]);
    const day = Number(named[2]);
    const year = Number(named[3] || new Date().getFullYear());
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  return '';
}

function isReasonableDate(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const min = new Date(Date.UTC(now.getUTCFullYear() - 2, 0, 1));
  const max = new Date(Date.UTC(now.getUTCFullYear() + 1, 11, 31));
  return parsed >= min && parsed <= max;
}

function normalizePost(post) {
  const id = cleanText(post.id);
  const title = cleanText(post.title);
  const date = cleanText(post.date);
  if (!id) fail('ParentSquare post is missing an id.');
  if (!title) fail(`ParentSquare post ${id} is missing a title.`);
  if (!date || !isReasonableDate(date)) fail(`ParentSquare post ${id} is missing a usable date.`);

  const bodyText = cleanText(post.bodyText || post.summary || title);
  return {
    id,
    title,
    summary: summarize(post.summary || bodyText),
    date,
    author: cleanText(post.author || 'Pioneer Valley High School'),
    url: cleanText(post.url),
    pinned: Boolean(post.pinned),
    body: paragraphHtml(bodyText),
    images: Array.isArray(post.images) ? post.images.filter(Boolean) : []
  };
}

async function waitForLoggedInFeed(page) {
  const deadline = Date.now() + 30 * 60 * 1000;
  let prompted = false;

  while (Date.now() < deadline) {
    if (!/\/signin\b/i.test(page.url())) {
      const count = await page.locator('a[href*="/feeds/"]').count().catch(() => 0);
      if (count > 0) return;
    }

    if (!prompted) {
      console.log('Sign in to ParentSquare in the opened window. Keep this command window open; I will continue automatically.');
      prompted = true;
    }
    await page.waitForTimeout(2000);
  }

  fail('ParentSquare was still on sign-in after 30 minutes. Leaving the browser open so you can finish signing in, then run this command again.');
}

async function scrapeFeedPosts(page) {
  return page.evaluate((maxPosts) => {
    const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const postLinks = Array.from(document.querySelectorAll('a[href*="/feeds/"]'))
      .map((link) => ({ link, id: (link.href.match(/\/feeds\/(\d+)/) || [])[1], href: link.href, title: clean(link.textContent) }))
      .filter((item) => item.id && item.title && !/^print$/i.test(item.title) && !/^read more/i.test(item.title));

    const posts = [];
    const seen = new Set();

    for (const item of postLinks) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);

      let card = item.link;
      for (let i = 0; i < 8 && card?.parentElement; i += 1) {
        card = card.parentElement;
        const links = Array.from(card.querySelectorAll('a[href*="/feeds/"]'));
        const hasThis = links.some((link) => link.href.includes(`/feeds/${item.id}`));
        const hasOtherPost = links.some((link) => {
          const id = (link.href.match(/\/feeds\/(\d+)/) || [])[1];
          return id && id !== item.id && !/^print$/i.test(clean(link.textContent));
        });
        if (hasThis && !hasOtherPost && clean(card.textContent).length > item.title.length + 20) break;
      }

      const text = clean(card?.textContent || item.link.closest('div')?.textContent || item.title);
      const author = (text.match(/Posted by\s+(.+?)(?:\s+[.•]\s+|\s+\d+\s+(?:hours?|days?) ago|\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),)/i) || [])[1] || '';
      const dateText = (text.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]{3,9}\s+\d{1,2}\s+at\s+\d{1,2}:\d{2}\s*(?:AM|PM)?/i) || [])[0] || '';
      const bodyText = text
        .replace(item.title, '')
        .replace(/Posted by\s+.+?(?:\s+[.•]\s+|\s+\d+\s+(?:hours?|days?) ago)/i, '')
        .replace(dateText, '')
        .replace(/\b(?:Appreciate|Comment|Print)\b/gi, '')
        .replace(/\b(?:Instant|User Preferred) Notifications\b.*$/i, '');

      const images = Array.from(card?.querySelectorAll('img[src]') || [])
        .map((img) => img.currentSrc || img.src)
        .filter((src) => /^https?:\/\//i.test(src))
        .filter((src) => !/avatar|logo|icon|spinner|transparent/i.test(src));

      posts.push({
        id: item.id,
        title: item.title,
        author,
        dateText,
        url: item.href.split('?')[0].split('#')[0],
        bodyText,
        images: [...new Set(images)]
      });

      if (posts.length >= maxPosts) break;
    }

    return posts;
  }, MAX_NEW_POSTS);
}

async function readExistingNews() {
  const data = JSON.parse(await readFile(NEWS_PATH, 'utf8'));
  if (!Array.isArray(data.posts)) fail('src/data/news.json does not contain posts.');
  return data.posts;
}

function mergePosts(newPosts, existingPosts) {
  const merged = [];
  const seen = new Set();

  for (const post of [...newPosts, ...existingPosts]) {
    const normalized = normalizePost(post);
    const key = normalized.id || normalized.url || `${normalized.title.toLowerCase()}|${normalized.date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(normalized);
  }

  merged.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return String(b.id).localeCompare(String(a.id));
  });

  return merged.slice(0, MAX_TOTAL_POSTS);
}

function runGit(args, options = {}) {
  return spawnSync('git', args, { encoding: 'utf8', ...options });
}

function publishIfRequested() {
  if (!SHOULD_PUBLISH) return;

  const diff = runGit(['diff', '--quiet', '--', 'src/data/news.json']);
  if (diff.status === 0) {
    console.log('No new news changes to publish.');
    return;
  }

  const add = runGit(['add', 'src/data/news.json']);
  if (add.status !== 0) fail(`Could not stage src/data/news.json: ${add.stderr || add.stdout}`);

  const commit = runGit(['commit', '-m', 'update news']);
  if (commit.status !== 0) {
    const message = `${commit.stdout}\n${commit.stderr}`;
    if (/nothing to commit|no changes added/i.test(message)) {
      console.log('No new news changes to publish.');
      return;
    }
    fail(`Could not commit news update: ${message}`);
  }

  const push = runGit(['push', 'origin', 'main'], { stdio: 'inherit' });
  if (push.status !== 0) fail('Could not push news update to GitHub.');
  console.log('Published news update.');
}

async function main() {
  const context = await chromium.launchPersistentContext(SESSION_DIR, {
    headless: false,
    executablePath: CHROME_PATH,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-crash-reporter', '--disable-crashpad']
  });
  const page = context.pages()[0] || await context.newPage();
  let completed = false;

  try {
    await page.goto(FEED_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForLoggedInFeed(page);
    await page.goto(FEED_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);

    const rawPosts = await scrapeFeedPosts(page);
    if (!rawPosts.length) fail('ParentSquare feed loaded, but I could not find posts.');

    const newPosts = rawPosts.map((post) => normalizePost({
      ...post,
      date: normalizeDate(post.dateText)
    }));
    const existingPosts = await readExistingNews();
    const posts = mergePosts(newPosts, existingPosts);

    await writeFile(NEWS_PATH, `${JSON.stringify({
      last_updated: new Date().toISOString(),
      source: 'ParentSquare',
      posts
    }, null, 2)}\n`);

    console.log(`Pulled ${newPosts.length} ParentSquare post(s). News now has ${posts.length} article(s).`);
    publishIfRequested();
    completed = true;
  } finally {
    if (completed) {
      await context.close();
    } else {
      console.log('Leaving the ParentSquare browser window open.');
    }
  }
}

main().catch((error) => {
  console.error(`ParentSquare pull failed: ${error.message}`);
  process.exitCode = 1;
});
