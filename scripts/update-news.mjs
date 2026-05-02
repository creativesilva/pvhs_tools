import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const inputPath = path.join(repoRoot, 'src', 'data', 'news.manual.json');
const outputPath = path.join(repoRoot, 'src', 'data', 'news.json');
const checkOnly = process.argv.includes('--check');

function fail(message) {
  throw new Error(message);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidDateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidUrl(value) {
  if (value === '') return true;
  if (typeof value !== 'string') return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function optionalString(value, fieldName, index) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') fail(`posts[${index}].${fieldName} must be a string.`);
  return value.trim();
}

function normalizePost(post, index, seenIds) {
  if (!isPlainObject(post)) fail(`posts[${index}] must be an object.`);

  const id = optionalString(post.id, 'id', index);
  const title = optionalString(post.title, 'title', index);
  const summary = optionalString(post.summary, 'summary', index);
  const date = optionalString(post.date, 'date', index);
  const author = optionalString(post.author, 'author', index);
  const url = optionalString(post.url, 'url', index);
  const body = optionalString(post.body, 'body', index);

  if (!id) fail(`posts[${index}].id is required.`);
  if (seenIds.has(id)) fail(`Duplicate post id: ${id}`);
  seenIds.add(id);

  if (!title) fail(`posts[${index}].title is required.`);
  if (!date) fail(`posts[${index}].date is required.`);
  if (!isValidDateOnly(date)) fail(`posts[${index}].date must use YYYY-MM-DD.`);
  if (!isValidUrl(url)) fail(`posts[${index}].url must be an http(s) URL or empty string.`);

  if (post.images !== undefined && !Array.isArray(post.images)) {
    fail(`posts[${index}].images must be an array.`);
  }

  const images = (post.images || []).map((image, imageIndex) => {
    if (typeof image !== 'string' || !isValidUrl(image.trim())) {
      fail(`posts[${index}].images[${imageIndex}] must be an http(s) URL.`);
    }
    return image.trim();
  });

  if (post.pinned !== undefined && typeof post.pinned !== 'boolean') {
    fail(`posts[${index}].pinned must be true or false.`);
  }

  return {
    id,
    title,
    summary,
    date,
    author,
    url,
    pinned: Boolean(post.pinned),
    body,
    images
  };
}

function comparePosts(a, b) {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  return b.id.localeCompare(a.id);
}

async function main() {
  const raw = await readFile(inputPath, 'utf8');
  let sourceData;

  try {
    sourceData = JSON.parse(raw);
  } catch (error) {
    fail(`Could not parse src/data/news.manual.json: ${error.message}`);
  }

  if (!isPlainObject(sourceData)) fail('src/data/news.manual.json must contain a JSON object.');
  if (!Array.isArray(sourceData.posts)) fail('src/data/news.manual.json must contain a posts array.');

  const seenIds = new Set();
  const posts = sourceData.posts.map((post, index) => normalizePost(post, index, seenIds));
  posts.sort(comparePosts);

  const output = {
    last_updated: new Date().toISOString(),
    source: typeof sourceData.source === 'string' && sourceData.source.trim()
      ? sourceData.source.trim()
      : 'ParentSquare',
    posts
  };

  if (checkOnly) {
    console.log(`OK: validated ${posts.length} posts in src/data/news.manual.json.`);
    return;
  }

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Updated src/data/news.json with ${posts.length} posts.`);
}

main().catch((error) => {
  console.error(`News update failed: ${error.message}`);
  process.exitCode = 1;
});
