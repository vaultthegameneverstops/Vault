#!/usr/bin/env python3
"""Build teams.json: team names -> logo + color for every NFL, NBA, college football and
college basketball team, plus the UFC league logo, from ESPN's public team lists.
Story art on VAULT uses it to show team logos. Usage: python3 tools/teams.py teams.json"""
import json, sys, datetime, urllib.request

BASE = "https://site.api.espn.com/apis/site/v2/sports/"
LEAGUES = {"nfl": "football/nfl", "cfb": "football/college-football", "nba": "basketball/nba", "cbb": "basketball/mens-college-basketball"}
UA = {"User-Agent": "Mozilla/5.0 (compatible; VAULT-teams/1.0)"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.load(r)


def logo_of(t):
    for l in t.get("logos") or []:
        rel = l.get("rel") or []
        if "default" in rel and "dark" not in rel:
            return l.get("href")
    return ((t.get("logos") or [{}])[0]).get("href")


def main():
    out = {"updatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "leagues": {}}
    for k, path in LEAGUES.items():
        try:
            d = get(BASE + path + "/teams?limit=1000")
            rows = []
            for sp in d.get("sports") or []:
                for lg in sp.get("leagues") or []:
                    for w in lg.get("teams") or []:
                        t = w.get("team") or w
                        lo = logo_of(t)
                        if not lo:
                            continue
                        rows.append([t.get("abbreviation"), t.get("displayName"), t.get("location"), t.get("name") or t.get("nickname"),
                                     t.get("shortDisplayName"), lo, "#" + (t.get("color") or "333333"), "#" + (t.get("alternateColor") or "999999")])
            out["leagues"][k] = rows
            print("%s: %d teams" % (k, len(rows)))
        except Exception as e:
            print("%s failed: %s" % (k, e), file=sys.stderr)
    try:
        sb = get(BASE + "mma/ufc/scoreboard")
        lg = (sb.get("leagues") or [{}])[0]
        lo = ((lg.get("logos") or [{}])[0]).get("href")
        out["ufc"] = lo or "https://a.espncdn.com/i/teamlogos/leagues/500/ufc.png"
        print("ufc logo:", out["ufc"])
    except Exception as e:
        print("ufc failed: %s" % e, file=sys.stderr)
    if not out["leagues"]:
        sys.exit(1)
    with open(sys.argv[1] if len(sys.argv) > 1 else "teams.json", "w") as f:
        json.dump(out, f, separators=(",", ":"))


if __name__ == "__main__":
    main()
