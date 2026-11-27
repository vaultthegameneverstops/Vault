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
- `tools/espn_pass.py`: fetches one pass of live scores from ESPN's public scoreboard
- `tools/live.py`: merges a live pass into `scores.json` / `plays.json`
- `.github/workflows/live-scores.yml`: runs both every 5 minutes, commits changes and deploys to GitHub Pages
- `brand/`, `brand.html`, `fonts/`: logo, brand page and self-hosted Inter fonts

## Hosting
Any static host works (GitHub Pages, Cloudflare Pages, Netlify, Vercel). Serve the repo root.
GitHub Pages on a private repo needs a paid GitHub plan; Cloudflare Pages and Netlify can deploy private repos for free.

Note: shared takes (`social.js`) use the claude.ai artifact storage, so posting takes only works on the claude.ai version.
The privacy page also says VAULT is hosted on claude.ai; update that wording in `legal.js` if you move to your own domain.

## Live scores (auto-update)
The **Live scores** GitHub Action runs every 5 minutes (GitHub may delay scheduled runs by a few minutes when busy).
It pulls NFL, college football, NBA and men's college basketball scores from ESPN's public scoreboard, merges them with `tools/live.py`,
commits `scores.json` / `plays.json` only when something changed; GitHub Pages publishes each commit.
Run it by hand from the Actions tab with *Run workflow*.
`data.json` (stories) is not touched by this job.

Football highlight plays (20+ yard passes, 15+ yard runs, takeaways, return scores) come from ESPN's play-by-play with full player names
and field spots. They are drawn on the stadium field (arrow + moving pieces), in each game's play tracker, and on the **Highlights** page (`#highlights`).
Only the passer, receiver, ball carrier and spot are real; other player positions are illustrative.

Basketball (NBA, college): a live shot chart plus threes, dunks and blocks from ESPN's play-by-play, drawn on the court.
UFC: the current or next fight card (bouts, records, live round, results) shows on the MMA page.
Team logos and colors come from the ESPN scoreboard feed and appear on scores, the ticker, game pages, the arena and highlights.
VAULT Writers (`#columns`): fictional writers file a column and quick takes on every game, live and final. Facts come from ESPN; the opinions are invented and labeled as takes.
To turn logos off, set `LOGOS_ON=false` in `app.js`.
Field pages (`#field-<game id>`): tap the stadium or "See the field bigger" to open the field full size. Drag to spin, scroll or +/− to zoom, and pick any big play to replay it.
Win probability: each pass reads ESPN's live win probability (and ESPN's pregame projection for every upcoming game on the scoreboard) into `scores.json` → `wp`. It shows as a bar on score cards, game pages and the stadium panel, and as a full-game graph (each team's peak and the biggest swing marked) on game and field pages. The **Win %** tab (`#win`) lists every game by league and Live / Upcoming / Final.
Live booth: on the game you're watching (stadium, game page or field page) the site also reads ESPN's play-by-play every 15 seconds, so the announcers call touchdowns, turnovers, big gains, threes, dunks and blocks right away.


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
