#!/usr/bin/env python3
"""Build one live pass (pass.json, the shape tools/live.py reads) from ESPN's public scoreboard.

Usage: python3 tools/espn_pass.py OUT_DIR
Writes OUT_DIR/pass.json. Leagues that fail to load are left out of "fetched",
so live.py keeps their previous games instead of dropping them.
"""
import json, os, re, sys, time, urllib.request, urllib.error, datetime

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
    scoring, sline = [], {}
    for p in s.get("scoringPlays") or []:
        per = period_label((p.get("period") or {}).get("number"))
        clk = (p.get("clock") or {}).get("displayValue", "")
        txt = (p.get("text") or "").strip()
        if not txt:
            continue
        tag = ((p.get("type") or {}).get("text") or "").strip()
        line = "%s %s: %s%s (%s %d-%d %s)" % (per, clk, txt, " [" + tag + "]" if tag else "", a_ab, num(p.get("awayScore")), num(p.get("homeScore")), h_ab)
        scoring.append(line)
        sline[str(p.get("id"))] = "s|" + line.strip()
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
    names = roster(box)
    hl = highlights(s, a_id, h_id, a_ab, h_ab, names, sline)
    return scoring, (fs if len(fs) == 2 else None), hl


# ---------- highlight plays ----------
NAME = r"[A-Z][A-Za-z'\-]*\.\s?[A-Za-z][A-Za-z'\-\.]*(?:\s(?:Jr\.|Sr\.|II|III|IV))?|[A-Z][a-z'\-]+(?:\s[A-Z][A-Za-z'\-]+){1,2}"


def nkey(s):
    """'J.Allen', 'J. Allen', 'Josh Allen' -> 'j.allen'"""
    s = re.sub(r"\s+(Jr\.?|Sr\.?|II|III|IV)$", "", str(s).strip())
    if "." in s.split(" ")[0]:
        ini, rest = s.split(".", 1)
        last = rest.strip().split(" ")[0]
    else:
        parts = s.split(" ")
        ini, last = parts[0], parts[1] if len(parts) > 1 else parts[0]
    return (ini[:1].lower() + "." + re.sub(r"[^a-z]", "", last.lower()))


def roster(box):
    """team id -> {'j.allen': 'Josh Allen', '#17': 'Josh Allen'} from the boxscore."""
    out = {}
    for t in box.get("players") or []:
        tid = str((t.get("team") or {}).get("id"))
        m = out.setdefault(tid, {})
        for st in t.get("statistics") or []:
            for a in st.get("athletes") or []:
                ath = a.get("athlete") or {}
                full = ath.get("displayName")
                if not full:
                    continue
                fn, ln = ath.get("firstName") or full.split(" ")[0], ath.get("lastName") or full.split(" ")[-1]
                m.setdefault(fn[:1].lower() + "." + re.sub(r"[^a-z]", "", ln.split(" ")[0].lower()), full)
                if ath.get("jersey"):
                    m.setdefault("#" + str(ath["jersey"]), full)
    return out


def full_name(raw, num_, names, tid):
    if not raw:
        return None
    m = names.get(tid) or {}
    if num_ and ("#" + num_) in m:
        return m["#" + num_]
    return m.get(nkey(raw)) or raw.strip()


P_PASS = re.compile(r"(?:#(\d+)\s+)?(" + NAME + r")\s+pass(?:\s+complete)?\s+(short|deep)?\s*(left|right|middle)?\s*(?:intended for|to)\s+(?:#(\d+)\s+)?(" + NAME + r")")
P_RUSH = re.compile(r"(?:#(\d+)\s+)?(" + NAME + r")\s+(?:rush|run|scrambles|up the middle|(left|right)\s+(?:end|tackle|guard))")
P_INT = re.compile(r"INTERCEPTED by\s+(?:#(\d+)\s+)?(" + NAME + r")", re.I)
P_RET = re.compile(r"(?:#(\d+)\s+)?(" + NAME + r")\s+(?:return|returns|to [A-Z]{2,4}\s?\d+ for)")


def clean(text):
    t = re.sub(r"^\(\d{1,2}:\d{2}\)\s*", "", text or "")
    t = re.sub(r"^(?:\((?:[^)]*)\)\s*|(?:No Huddle-)?Shotgun\s+|No Huddle\s+)+", "", t)
    return t.strip()


def highlights(s, a_id, h_id, a_ab, h_ab, names, sline=None):
    drives = s.get("drives") or {}
    dl = list(drives.get("previous") or [])
    if drives.get("current"):
        dl.append(drives["current"])
    seen, out = set(), []
    ab = {a_id: a_ab, h_id: h_ab}

    def absy(tid, ytez):
        # yards from the away team's goal line (left end zone). The away team drives left -> right.
        y = num(ytez, 50)
        return max(0, min(100, 100 - y if tid == a_id else y))

    for d in dl:
        for p in d.get("plays") or []:
            pid = str(p.get("id"))
            if pid in seen:
                continue
            seen.add(pid)
            ty = ((p.get("type") or {}).get("text") or "")
            txt = clean(p.get("text"))
            yd = num(p.get("statYardage"))
            st, en = p.get("start") or {}, p.get("end") or {}
            off = str((st.get("team") or {}).get("id") or (d.get("team") or {}).get("id"))
            if off not in ab:
                continue
            dfn = h_id if off == a_id else a_id
            td = "Touchdown" in ty or "TOUCHDOWN" in txt.upper()
            tov = bool(p.get("isTurnover")) or "Interception" in ty or ("Fumble" in ty and "Opponent" in ty)
            kind = None
            if tov:
                kind = "int" if ("Interception" in ty or "INTERCEPT" in txt.upper()) else "fum"
            elif ty in ("Pass Reception", "Passing Touchdown") and (yd >= 20 or td):
                kind = "pass"
            elif ty in ("Rush", "Rushing Touchdown") and (yd >= 15 or td):
                kind = "rush"
            elif "Return Touchdown" in ty or ("Return" in ty and yd >= 40):
                kind = "ret"
            if not kind:
                continue
            s0 = absy(off, st.get("yardsToEndzone"))
            dirn = 1 if off == a_id else -1
            h = {"id": pid, "ty": kind, "t": period_label((p.get("period") or {}).get("number")) + " " + ((p.get("clock") or {}).get("displayValue") or ""),
                 "off": ab[off], "def": ab[dfn], "s": s0, "yd": yd, "td": td, "sa": num(p.get("awayScore")), "sh": num(p.get("homeScore")), "txt": txt[:220]}
            if sline and pid in sline:
                h["sk"] = sline[pid]
            lane = re.search(r"\b(left|right|middle)\b", txt)
            h["ln"] = {"left": -1, "right": 1}.get(lane.group(1), 0) if lane else 0
            if kind in ("pass", "rush", "ret"):
                h["e"] = (100 if dirn > 0 else 0) if td else max(0, min(100, s0 + dirn * yd))
            else:
                et = str((en.get("team") or {}).get("id"))
                h["e"] = absy(et, en.get("yardsToEndzone")) if et in ab else s0
            if kind in ("pass", "int"):
                m = P_PASS.search(txt)
                if m:
                    h["qb"] = full_name(m.group(2), m.group(1), names, off)
                    h["rc"] = full_name(m.group(6), m.group(5), names, off)
                    h["dp"] = m.group(3) == "deep"
                if kind == "int":
                    m = P_INT.search(txt)
                    if m:
                        h["by"] = full_name(m.group(2), m.group(1), names, dfn)
            elif kind == "rush":
                m = P_RUSH.search(txt)
                if m:
                    h["by"] = full_name(m.group(2), m.group(1), names, off)
            elif kind == "ret":
                m = P_RET.search(txt.split(".")[-2] if txt.count(".") > 1 else txt)
                if m:
                    h["by"] = full_name(m.group(2), m.group(1), names, off)
            out.append(h)
    return out[-30:]


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
                g["scoring"], fs, g["hl"] = football_extras(path, g["id"], str(ta.get("id")), str(th.get("id")), g["a"], g["h"])
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
