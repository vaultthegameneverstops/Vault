#!/usr/bin/env python3
"""Build one live pass (pass.json, the shape tools/live.py reads) from ESPN's public scoreboard.

Usage: python3 tools/espn_pass.py OUT_DIR
Writes OUT_DIR/pass.json. Leagues that fail to load are left out of "fetched",
so live.py keeps their previous games instead of dropping them.
"""
import json, os, sys, time, urllib.request, urllib.error, datetime

BASE = "https://site.api.espn.com/apis/site/v2/sports/"
LEAGUES = {
    # pass key: (espn path, extra scoreboard query)
    "nfl": ("football/nfl", ""),
    "ncaafb": ("football/college-football", "groups=80&limit=300"),
    "nba": ("basketball/nba", ""),
    "ncaamb": ("basketball/mens-college-basketball", "groups=50&limit=400"),
}
FOOTBALL = {"nfl", "ncaafb"}
UA = "Mozilla/5.0 (compatible; VAULT-scores/1.0; +https://github.com/vaultthegameneverstops/Vault)"


def get(url, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r)
        except (urllib.error.URLError, TimeoutError, ValueError) as e:
            if i == tries - 1:
                raise
            time.sleep(2 * (i + 1))


def num(v, d=0):
    try:
        return int(float(str(v).replace(",", "")))
    except Exception:
        return d


def status(ev):
    t = ((ev.get("status") or {}).get("type")) or {}
    name, state = t.get("name", ""), t.get("state", "")
    if name == "STATUS_HALFTIME":
        return "halftime"
    if state == "in":
        return "inprogress"
    if state == "post":
        return "closed" if t.get("completed", True) else "postponed"
    return "scheduled"


def period_label(p):
    p = num(p)
    return "OT" if p > 4 else "Q%d" % p


def team_stat(team, *names):
    for s in team.get("statistics") or []:
        if s.get("name") in names:
            return num(s.get("displayValue", s.get("value")))
    return 0


def longest(players_side, group):
    """Longest gain in a boxscore stat group (rushing / receiving) from the LONG column."""
    best = 0
    for st in players_side.get("statistics") or []:
        if st.get("name") != group:
            continue
        labels = [str(x).upper() for x in (st.get("labels") or [])]
        keys = [str(x) for x in (st.get("keys") or [])]
        idx = None
        for want in ("LONG",):
            if want in labels:
                idx = labels.index(want)
        if idx is None:
            for k in ("longRushing", "longReception"):
                if k in keys:
                    idx = keys.index(k)
        if idx is None:
            continue
        for a in st.get("athletes") or []:
            vals = a.get("stats") or []
            if idx < len(vals):
                best = max(best, num(vals[idx]))
    return best


def football_extras(path, ev_id, a_id, h_id, a_ab, h_ab):
    s = get(BASE + path + "/summary?event=" + ev_id)
    scoring = []
    for p in s.get("scoringPlays") or []:
        per = period_label((p.get("period") or {}).get("number"))
        clk = (p.get("clock") or {}).get("displayValue", "")
        txt = (p.get("text") or "").strip()
        if not txt:
            continue
        scoring.append("%s %s: %s (%s %d-%d %s)" % (per, clk, txt, a_ab, num(p.get("awayScore")), num(p.get("homeScore")), h_ab))
    fs = {}
    box = s.get("boxscore") or {}
    teams = {str((t.get("team") or {}).get("id")): t for t in box.get("teams") or []}
    players = {str((t.get("team") or {}).get("id")): t for t in box.get("players") or []}
    for side, tid in (("a", a_id), ("h", h_id)):
        t = teams.get(tid)
        if not t:
            continue
        p = players.get(tid) or {}
        fs[side] = {
            "to": team_stat(t, "turnovers", "totalTurnovers"),
            "yds": team_stat(t, "totalYards"),
            "lr": longest(p, "rushing"),
            "lc": longest(p, "receiving"),
        }
    return scoring, (fs if len(fs) == 2 else None)


def leaders(comp):
    out = {}
    for c in comp.get("competitors") or []:
        side = "h" if c.get("homeAway") == "home" else "a"
        for L in c.get("leaders") or []:
            if L.get("name") in ("points", "pointsPerGame") and L.get("leaders"):
                top = L["leaders"][0]
                nm = ((top.get("athlete") or {}).get("displayName")) or ""
                if nm:
                    out[side] = {"ld": nm, "pts": num(top.get("value", top.get("displayValue")))}
                break
    return out if len(out) == 2 else None


def league(key, path, q):
    url = BASE + path + "/scoreboard" + ("?" + q if q else "")
    sb = get(url)
    games = []
    for ev in sb.get("events") or []:
        comp = (ev.get("competitions") or [{}])[0]
        cs = comp.get("competitors") or []
        home = next((c for c in cs if c.get("homeAway") == "home"), None)
        away = next((c for c in cs if c.get("homeAway") == "away"), None)
        if not home or not away:
            continue
        st = status(ev)
        if st == "scheduled":
            continue
        ta, th = away.get("team") or {}, home.get("team") or {}
        stt = ev.get("status") or {}
        g = {
            "lg": key, "id": str(ev.get("id")),
            "a": ta.get("abbreviation", "?"), "h": th.get("abbreviation", "?"),
            "an": ta.get("displayName", ta.get("abbreviation", "")), "hn": th.get("displayName", th.get("abbreviation", "")),
            "as": num(away.get("score")), "hs": num(home.get("score")),
            "status": st, "clock": stt.get("displayClock", ""), "quarter": num(stt.get("period")),
            "start": ev.get("date", ""),
        }
        if key in FOOTBALL and st in ("inprogress", "halftime", "closed"):
            try:
                g["scoring"], fs = football_extras(path, g["id"], str(ta.get("id")), str(th.get("id")), g["a"], g["h"])
                if fs:
                    g["fs"] = fs
            except Exception as e:
                print("summary %s %s failed: %s" % (key, g["id"], e), file=sys.stderr)
        elif key not in FOOTBALL:
            bs = leaders(comp)
            if bs:
                g["bs"] = bs
        games.append(g)
    return games


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/vault_live"
    os.makedirs(out_dir, exist_ok=True)
    fetched, games = [], []
    for key, (path, q) in LEAGUES.items():
        try:
            gs = league(key, path, q)
            fetched.append(key)
            games.extend(gs)
            print("%s: %d games" % (key, len(gs)))
        except Exception as e:
            print("%s failed: %s" % (key, e), file=sys.stderr)
    if not fetched:
        print("NO_DATA", file=sys.stderr)
        sys.exit(1)
    with open(os.path.join(out_dir, "pass.json"), "w") as f:
        json.dump({"fetched": fetched, "games": games,
                   "at": datetime.datetime.now(datetime.timezone.utc).isoformat()}, f)


if __name__ == "__main__":
    main()
