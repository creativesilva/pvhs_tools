import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import path from 'node:path';

const NEWS_PATH = path.resolve('src/data/news.json');
const MAX_NEW_POSTS = 10;
const MAX_TOTAL_POSTS = 20;
const DEFAULT_AUTHOR = 'Pioneer Valley High School';
const SHOULD_PUBLISH = process.argv.includes('--publish');

function fail(message) {
  throw new Error(message);
}

function cleanText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
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
  const paragraphs = cleanText(text)
    .split(/\n{2,}/)
    .map(escapeHtml)
    .filter(Boolean);
  return paragraphs.length ? paragraphs.map((p) => `<p>${p}</p>`).join('') : '';
}

function summarize(text) {
  const cleaned = cleanText(text);
  if (cleaned.length <= 180) return cleaned;
  return `${cleaned.slice(0, 177).trim()}...`;
}

function hashId(title, date) {
  return `ps-${crypto.createHash('sha1').update(`${title}|${date}`).digest('hex').slice(0, 12)}`;
}

function feedIdFromText(text) {
  return text.match(/parentsquare\.com\/feeds\/(\d+)/i)?.[1] || text.match(/\/feeds\/(\d+)/i)?.[1] || '';
}

function feedUrlFromText(text) {
  const match = text.match(/https?:\/\/(?:www\.)?parentsquare\.com\/feeds\/\d+/i);
  if (match) return match[0].replace(/^http:/, 'https:');
  const id = feedIdFromText(text);
  return id ? `https://www.parentsquare.com/feeds/${id}` : '';
}

function monthNumber(month) {
  const key = month.toLowerCase().slice(0, 3);
  return {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
  }[key] || 0;
}

function normalizeDate(rawValue) {
  const value = cleanText(rawValue);
  if (!value) return '';

  const iso = value.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
  if (iso) return iso[0];

  const named = value.match(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?(?:\s+at\s+[^\d]*)?(?:\s*(20\d{2}))?/i)
    || value.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s*(20\d{2})?/i);
  if (named) {
    const month = monthNumber(named[1]);
    const day = Number(named[2]);
    const year = Number(named[3] || new Date().getFullYear());
    if (month && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const numeric = value.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (numeric) {
    const year = Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]);
    return `${year}-${String(Number(numeric[1])).padStart(2, '0')}-${String(Number(numeric[2])).padStart(2, '0')}`;
  }

  return '';
}

function dateLooksReasonable(date) {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const twoYearsAgo = new Date(Date.UTC(now.getUTCFullYear() - 2, 0, 1));
  const oneYearAhead = new Date(Date.UTC(now.getUTCFullYear() + 1, 11, 31));
  return parsed >= twoYearsAgo && parsed <= oneYearAhead;
}

function isNoiseLine(line) {
  return /^(ParentSquare|Home|Admin|Espa(?:ñ|n)ol|Pioneer Valley High School|Viewing:|My School|Classes and Groups|COMMUNICATE|EXPLORE|PARTICIPATE|Posts|Messages|Alerts and Notices|Directory|Calendar|Photos, Videos, Files|Links|Secure Documents|Groups|Quick Access|EVENTS|PHOTOS|FILES|Privacy|Terms of Use|Appreciate|Comment|Print|Previous|Next)$/i.test(line)
    || /^Switch to your parent account/i.test(line)
    || /^Send updates and announcements/i.test(line)
    || /^User Preferred Notifications/i.test(line)
    || /^Instant Notifications/i.test(line)
    || /^\d+\s+people?\s+appreciate/i.test(line)
    || /^\d+$/.test(line)
    || /^[←→]/.test(line);
}

function titleCandidate(line) {
  if (!line || line.length < 4 || line.length > 180) return false;
  if (isNoiseLine(line)) return false;
  if (/^(Posted by|Read More about|https?:\/\/|parentsquare\.com\/feeds|[.•])/.test(line)) return false;
  if (/\b(?:hours?|days?) ago\b/i.test(line)) return false;
  if (/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]{3,9}\s+\d{1,2}\s+at\b/i.test(line)) return false;
  return /[A-Za-z0-9]/.test(line);
}

function findDate(lines) {
  for (const line of lines) {
    const date = normalizeDate(line);
    if (date && dateLooksReasonable(date)) return date;
  }
  return '';
}

function findAuthor(lines) {
  const postedBy = lines.find((line) => /^Posted by\s+/i.test(line));
  if (postedBy) return cleanText(postedBy.replace(/^Posted by\s+/i, ''));

  const compact = lines.join(' ');
  const inline = compact.match(/\bPosted by\s+(.+?)(?:\s+[.•]\s+|\s+\d+\s+(?:hours?|days?) ago|\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),)/i);
  if (inline) return cleanText(inline[1]);

  return DEFAULT_AUTHOR;
}

function bodyFromLines(title, lines) {
  const bodyLines = lines
    .filter((line) => line !== title)
    .filter((line) => !isNoiseLine(line))
    .filter((line) => !/^Posted by\s+/i.test(line))
    .filter((line) => !/^Read More about /i.test(line))
    .filter((line) => !/\b(?:hours?|days?) ago\b/i.test(line))
    .filter((line) => !/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]{3,9}\s+\d{1,2}\s+at\b/i.test(line))
    .filter((line) => !/^https?:\/\//i.test(line))
    .slice(0, 24);

  return cleanText(bodyLines.join('\n'));
}

function splitByFeedUrls(text) {
  const matches = [...text.matchAll(/https?:\/\/(?:www\.)?parentsquare\.com\/feeds\/\d+/gi)];
  if (matches.length < 2) return [];

  return matches.map((match, index) => {
    const start = Math.max(0, text.lastIndexOf('\n', match.index - 220));
    const end = matches[index + 1] ? Math.max(match.index + match[0].length, matches[index + 1].index - 220) : text.length;
    return text.slice(start, end);
  });
}

function splitByVisibleFeed(lines) {
  const starts = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (!titleCandidate(lines[index])) continue;
    const nearbyLines = lines.slice(index + 1, index + 6);
    const windowText = nearbyLines.join(' ');
    if (/Posted by\s+/i.test(windowText) && /\b(?:hours?|days?) ago\b|\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]{3,9}\s+\d{1,2}\s+at\b/i.test(windowText)) {
      starts.push(index);
    }
  }

  const chunks = [];
  for (let i = 0; i < starts.length; i += 1) {
    const chunkLines = lines.slice(starts[i], starts[i + 1] || lines.length);
    if (chunkLines.length >= 3) chunks.push(chunkLines.join('\n'));
  }
  return chunks;
}

function parseChunk(chunk) {
  const lines = chunk
    .split(/\r?\n/)
    .map(cleanText)
    .filter(Boolean);

  const title = lines.find(titleCandidate) || '';
  const date = findDate(lines);
  if (!title || !date) return null;

  const url = feedUrlFromText(chunk);
  const id = feedIdFromText(chunk) || hashId(title, date);
  const bodyText = bodyFromLines(title, lines);

  return {
    id,
    title,
    summary: summarize(bodyText || title),
    date,
    author: findAuthor(lines),
    url,
    pinned: false,
    body: paragraphHtml(bodyText || title),
    images: []
  };
}

function parsePosts(rawText) {
  const text = String(rawText || '').replace(/\r/g, '\n');
  const lines = text.split('\n').map(cleanText).filter(Boolean);
  const fallbackChunks = splitByVisibleFeed(lines);
  const chunks = fallbackChunks.length ? fallbackChunks : splitByFeedUrls(text);
  const seen = new Set();
  const posts = [];

  for (const chunk of chunks) {
    const post = parseChunk(chunk);
    if (!post) continue;
    const keys = [
      post.id,
      post.url,
      `${post.title.toLowerCase()}|${post.date}`
    ].filter(Boolean);
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    posts.push(post);
    if (posts.length >= MAX_NEW_POSTS) break;
  }

  if (!posts.length) {
    fail('I could not find any ParentSquare posts in the copied text. Open the feed, select the top posts, copy, then run again.');
  }

  return posts;
}

async function readClipboard() {
  const result = spawnSync('pbpaste', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) fail('Could not read the clipboard.');
  if (!cleanText(result.stdout)) fail('Clipboard is empty. Copy the ParentSquare posts first.');
  return result.stdout;
}

async function readExistingNews() {
  const data = JSON.parse(await readFile(NEWS_PATH, 'utf8'));
  if (!Array.isArray(data.posts)) fail('src/data/news.json does not contain a posts array.');
  return data.posts;
}

function normalizeExistingPost(post) {
  return {
    id: cleanText(post.id),
    title: cleanText(post.title),
    summary: cleanText(post.summary),
    date: cleanText(post.date),
    author: cleanText(post.author || DEFAULT_AUTHOR),
    url: cleanText(post.url),
    pinned: Boolean(post.pinned),
    body: post.body || paragraphHtml(post.summary || post.title),
    images: Array.isArray(post.images) ? post.images : []
  };
}

function dedupeKey(post) {
  return post.id || post.url || `${post.title.toLowerCase()}|${post.date}`;
}

function mergePosts(newPosts, existingPosts) {
  const merged = [];
  const seen = new Set();

  for (const post of [...newPosts, ...existingPosts.map(normalizeExistingPost)]) {
    if (!post.id || !post.title || !post.date) continue;
    const key = dedupeKey(post);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(post);
  }

  merged.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return String(b.id).localeCompare(String(a.id));
  });

  return merged.slice(0, MAX_TOTAL_POSTS);
}

function runGit(args, options = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8', ...options });
  return result;
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
  console.log('Published news update to GitHub Pages source branch.');
}

async function main() {
  const clipboardText = await readClipboard();
  const newPosts = parsePosts(clipboardText);
  const existingPosts = await readExistingNews();
  const posts = mergePosts(newPosts, existingPosts);

  const output = {
    last_updated: new Date().toISOString(),
    source: 'ParentSquare',
    posts
  };

  await writeFile(NEWS_PATH, `${JSON.stringify(output, null, 2)}\n`);
  JSON.parse(await readFile(NEWS_PATH, 'utf8'));

  console.log(`Updated src/data/news.json with ${newPosts.length} copied ParentSquare post(s).`);
  console.log(`News file now contains ${posts.length} total post(s).`);
  publishIfRequested();
}

main().catch((error) => {
  console.error(`News update failed: ${error.message}`);
  process.exitCode = 1;
});
