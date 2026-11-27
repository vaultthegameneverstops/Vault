# VAULT
VAULT — sports news, scores and top performances for the NFL, NBA, college football, college basketball and UFC. Updated every hour.

A static site: `index.html` plus plain JS, CSS and JSON data. No build step.

## Files
- `index.html`, `app.js`, `styles.css`: the main site
- `fx.js` / `fx.css`: animations and the live-game stadium
- `premium.js` / `premium.json`: Intel, Matchup Lab, My VAULT and the other "Plus" sections (currently free for everyone)
- `legal.js`: Privacy, Terms, Cookies & storage and the other policy pages
- `social.js`: shared takes
- `ads.js` / `ads.txt`: Google AdSense (off until configured, see below)
- `data.json`, `scores.json`, `plays.json`, `performances.json`: the content feed
- `tools/live.py.txt`: the script that merges live score passes into `scores.json` / `plays.json`
- `brand/`, `brand.html`, `fonts/`: logo, brand page and self-hosted Inter fonts

## Hosting
Any static host works (GitHub Pages, Cloudflare Pages, Netlify, Vercel). Serve the repo root.
GitHub Pages on a private repo needs a paid GitHub plan; Cloudflare Pages and Netlify can deploy private repos for free.

Note: shared takes (`social.js`) use the claude.ai artifact storage, so posting takes only works on the claude.ai version.
The privacy page also says VAULT is hosted on claude.ai; update that wording in `legal.js` if you move to your own domain.

## Ads (Google AdSense)
Ads are **off** until you add your publisher ID. They never run on the claude.ai preview, never appear on policy pages, and are labelled "Advertisement".

1. Host VAULT on your own domain and apply at https://adsense.google.com.
2. In `ads.js`, set `CLIENT` to your ID (`ca-pub-` + 16 digits).
3. In `ads.txt`, replace `pub-0000000000000000` with the same number.
4. Optional: create three Display ad units in AdSense and paste their IDs into `SLOTS` (`top`, `mid`, `end`).
   With slot IDs: one banner above the page, one after the story text (or before the 3rd section on feeds), one at the bottom.
   Without slot IDs: AdSense Auto ads decide placement.
5. In AdSense > Privacy & messaging, turn on the GDPR message (required for EU/UK/Swiss visitors) and the US state regulations message.

Once `CLIENT` is set, the Privacy, Cookies & storage and Credits pages switch to wording that discloses the ads, and Cookies & storage gains an "Ad choices" control so visitors can switch to non-personalized ads.
