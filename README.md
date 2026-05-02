# PVHS Tools

PVHS Tools is a static web app served from the files in this repository. The main app is `index.html`, and the News tab reads from `src/data/news.json`.

## One-Click ParentSquare News Workflow

Use `Update PVHS News.command` for the simplest update flow.

1. Double-click `Update PVHS News.command`.
2. ParentSquare opens.
3. Select and copy the newest posts from the ParentSquare feed.
4. Return to the command window and press Enter.
5. The script updates `src/data/news.json`, commits only that file, and pushes to `origin main`.

The command never runs `git add .`, and it does not stage large local design files.

## Manual ParentSquare News Workflow

This project does not scrape ParentSquare, does not log in to ParentSquare, and does not push changes automatically when news files change.

You can also run the same update from Terminal:

```bash
npm run news:pull
```

For a no-push local update, copy posts and run:

```bash
npm run news:paste
```

The app-facing file is still `src/data/news.json`; do not edit `index.html` for normal news updates.

## JSON Staging

Each post in `src/data/news.manual.json` should use this shape:

```json
{
  "id": "parentsquare-post-id",
  "title": "Post title",
  "summary": "Short summary shown on the News card.",
  "date": "2026-05-01",
  "author": "Author name",
  "url": "https://www.parentsquare.com/feeds/00000000",
  "pinned": false,
  "body": "<p>Full post body shown after opening the card.</p>",
  "images": []
}
```

Required fields are `id`, `title`, and `date`. Dates must use `YYYY-MM-DD`. Image URLs, when present, must be `http` or `https` URLs.
