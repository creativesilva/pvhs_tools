# PVHS Tools

PVHS Tools is a static web app served from the files in this repository. The main app is `index.html`, and the News tab reads from `src/data/news.json`.

## One-Click ParentSquare News Workflow

Use `Update PVHS News.command` for the simplest update flow, or run `npm run news:pull` from Terminal.

1. Double-click `Update PVHS News.command`.
2. ParentSquare opens.
3. If ParentSquare asks you to sign in, sign in once and leave the update window open.
4. The script pulls the 10 newest ParentSquare posts, including full post bodies and images.
5. The script updates `src/data/news.json` and keeps no more than 20 total articles.

The command does not stage, commit, push, or deploy. Review the News tab, then commit and push when ready.

## Manual ParentSquare News Workflow

This project uses your local ParentSquare browser session. It does not automate ParentSquare login and does not push changes automatically when news files change.

You can also run the same update from Terminal:

```bash
npm run news:pull
```

For the older editable JSON staging flow, edit `src/data/news.manual.json` and run:

```bash
npm run news:update
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
