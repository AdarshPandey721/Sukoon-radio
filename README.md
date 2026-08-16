<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e020270b-4531-4d35-8757-6368c48a243c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## How this was built

This site was generated in [Google AI Studio](https://ai.studio) — I described the
site in plain language (a single-page nostalgia radio player, hand-painted
background art, a live YouTube-powered player, retro Bollywood-radio UI) and
AI Studio scaffolded the whole React + Vite + Tailwind project from that
prompt, iterated with follow-up messages until the UI matched, then exported
the code straight to this repo.

> Note: this app doesn't actually call the Gemini API at runtime — the
> `GEMINI_API_KEY` line above is just AI Studio's default project template.
> You can ignore it; you do **not** need to set that key to run or deploy this
> site, since all the music comes from YouTube, not Gemini.

### The starter prompt

Rough shape of the prompt I used to generate this in AI Studio — feel free to
reuse and adapt it for your own version:

```
Build a single-page nostalgia music radio site.

- One hero screen: a hand-painted/illustrated full-bleed background (I'll
  provide separate landscape and portrait artwork), with the site name in
  large type centered on it.
- Fixed top bar: live clock (top-left), a simulated "N online" listener
  counter (top-center), Spotify / YT Music links + Playlists / Songs buttons
  (top-right).
- A floating glass-morphism player pinned to the bottom: album-art circle,
  track title + artist, seek bar, elapsed/duration, prev/play-pause/next.
  Different layout for desktop (horizontal pill) vs mobile (stacked card).
- No audio files — play music by driving the YouTube IFrame Player API from
  a playlist ID, with the player rendered visibly (not hidden), so ad-skip
  controls stay usable.
- A "Songs" panel listing every track in the playlist, clickable to jump to
  that track.
- A dismissible WhatsApp-channel promo banner near the player.
- Fully responsive, Tailwind CSS, no backend/database.
```

## Deploying on Vercel (free)

1. Push this repo to GitHub (already done ✅).
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New
   Project** → select this repo.
3. Vercel auto-detects the Vite/React build — leave settings on default →
   **Deploy**.
4. You'll get a free live URL like `sukoon-radio.vercel.app`. Every future
   `git push` to `main` auto-redeploys.
5. *(Optional)* Connect a custom domain under Project → Settings → Domains.

No environment variables are required for this deploy — see the note above.
