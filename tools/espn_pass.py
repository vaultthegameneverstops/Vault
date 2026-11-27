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


SUMMARIES = {}


def pct(v):
    """ESPN gives win probability as 0-1 (live) or 0-100 (pregame projection). Returns home % 0-100."""
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    if v <= 1.0:
        v *= 100
    return round(max(0.0, min(100.0, v)), 1)


def win_prob(s, h_id):
    """Home team's win chance from a summary: the live win-probability line, else ESPN's pregame projection."""
    wp = s.get("winprobability") or []
    if wp:
        v = pct((wp[-1] or {}).get("homeWinPercentage"))
        if v is not None:
            return v, "live"
    pr = s.get("predictor") or {}
    ht, at = pr.get("homeTeam") or {}, pr.get("awayTeam") or {}
    if str(ht.get("id", h_id)) != str(h_id) and str(at.get("id")) == str(h_id):
        ht, at = at, ht
    v = pct(ht.get("gameProjection"))
    if v is None and at.get("gameProjection") is not None:
        a = pct(at.get("gameProjection"))
        v = None if a is None else round(100 - a, 1)
    return (v, "pre") if v is not None else (None, None)


def wp_series(s, n=90):
    """The live win-probability line as [[home %, period], ...], thinned to about n points
    (each team's peak is always kept so comebacks and collapses stay visible)."""
    wp = s.get("winprobability") or []
    per = {}
    for p in s.get("plays") or []:
        per[str(p.get("id"))] = num((p.get("period") or {}).get("number"))
    for d in ((s.get("drives") or {}).get("previous") or []) + ([(s.get("drives") or {}).get("current")] if (s.get("drives") or {}).get("current") else []):
        for p in (d or {}).get("plays") or []:
            per[str(p.get("id"))] = num((p.get("period") or {}).get("number"))
    pts, last = [], 1
    for w in wp:
        v = pct((w or {}).get("homeWinPercentage"))
        if v is None:
            continue
        q = per.get(str((w or {}).get("playId")), 0) or last
        last = q
        pts.append([v, q])
    if len(pts) <= n:
        return pts
    keep = {0, len(pts) - 1}
    keep.add(max(range(len(pts)), key=lambda i: pts[i][0]))
    keep.add(min(range(len(pts)), key=lambda i: pts[i][0]))
    step = (len(pts) - 1) / float(n - len(keep))
    keep.update(int(round(i * step)) for i in range(n - len(keep) + 1))
    return [pts[i] for i in sorted(k for k in keep if 0 <= k < len(pts))]


def football_extras(path, ev_id, a_id, h_id, a_ab, h_ab):
    s = get(BASE + path + "/summary?event=" + ev_id)
    SUMMARIES[ev_id] = s
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
    rp, dr = recent_football(s, a_id, h_id, a_ab, h_ab)
    return scoring, (fs if len(fs) == 2 else None), hl, rp, dr


def recent_football(s, a_id, h_id, a_ab, h_ab):
    """Last 14 snaps (with down & distance) and the current drive, for the booth's play-by-play."""
    drives = s.get("drives") or {}
    dl = list(drives.get("previous") or [])
    if drives.get("current"):
        dl.append(drives["current"])
    ab = {a_id: a_ab, h_id: h_ab}
    out, seen = [], set()
    for d in dl:
        for p in d.get("plays") or []:
            pid = str(p.get("id"))
            if pid in seen:
                continue
            seen.add(pid)
            st = p.get("start") or {}
            off = str((st.get("team") or {}).get("id") or (d.get("team") or {}).get("id"))
            out.append({"id": pid, "t": period_label((p.get("period") or {}).get("number")) + " " + ((p.get("clock") or {}).get("displayValue") or ""),
                        "dd": st.get("downDistanceText") or "", "ty": ((p.get("type") or {}).get("text") or ""), "tx": clean(p.get("text"))[:260],
                        "yd": num(p.get("statYardage")), "off": ab.get(off, ""), "sc": bool(p.get("scoringPlay")),
                        "sa": num(p.get("awayScore")), "sh": num(p.get("homeScore"))})
    cur = drives.get("current") or (dl[-1] if dl else None)
    dr = None
    if cur:
        dr = {"tm": ab.get(str((cur.get("team") or {}).get("id")), ""), "d": cur.get("description") or "", "res": cur.get("displayResult") or ""}
    return out[-14:], dr


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
            up = txt.upper()
            if "NULLIFIED" in up or "REVERSED" in up or "NO PLAY" in up:
                continue
            td = "Touchdown" in ty or (bool(p.get("scoringPlay")) and "TOUCHDOWN" in up)
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


def team_meta(c, side):
    """logo, colors and record for one side of a scoreboard event."""
    t = c.get("team") or {}
    out = {}
    if t.get("logo"):
        out[side + "lg"] = t["logo"]
    if t.get("color"):
        out[side + "c"] = "#" + t["color"].lstrip("#")
    if t.get("alternateColor"):
        out[side + "c2"] = "#" + t["alternateColor"].lstrip("#")
    for r in c.get("records") or []:
        if r.get("type") == "total" or r.get("name") == "overall":
            out[side + "r"] = r.get("summary")
            break
    return out


def recent_start(start):
    try:
        st0 = datetime.datetime.fromisoformat(start.replace("Z", "+00:00"))
        return (datetime.datetime.now(datetime.timezone.utc) - st0).total_seconds() < 5 * 3600
    except Exception:
        return False


def hoops_period(p, key):
    n = num((p.get("period") or {}).get("number"))
    if key == "ncaamb":
        return "H%d" % n if n <= 2 else "OT%d" % (n - 2)
    return "Q%d" % n if n <= 4 else "OT%d" % (n - 4)


P_MAKE = re.compile(r"^(.+?)\s+makes\s+(?:(\d+)-foot\s+)?(.*?)(?:\s*\((.+?) assists?\))?\s*$")
P_BLK = re.compile(r"^(.+?)\s+blocks\s+(.+?)\s*'s")
P_BLK2 = re.compile(r"^(.+?)\s+Block\.?$")
P_MISS = re.compile(r"^(.+?)\s+misses\b")


def hoops_extras(path, ev_id, key, a_id, h_id, a_ab, h_ab):
    """Shot chart (last 90 field-goal tries) and highlight plays (made threes, dunks, blocks)."""
    s = get(BASE + path + "/summary?event=" + ev_id)
    SUMMARIES[ev_id] = s
    ab = {a_id: a_ab, h_id: h_ab}
    shots, hl, miss = [], [], None
    for p in s.get("plays") or []:
        tid = str((p.get("team") or {}).get("id"))
        if tid not in ab:
            continue
        ty = ((p.get("type") or {}).get("text") or "")
        txt = (p.get("text") or "").strip()
        co = p.get("coordinate") or {}
        x, y = co.get("x"), co.get("y")
        side = "a" if tid == a_id else "h"
        made = bool(p.get("scoringPlay"))
        val = num(p.get("scoreValue"))
        mm = P_MISS.search(txt) if p.get("shootingPlay") and not p.get("scoringPlay") else None
        prev_miss = miss
        if mm:
            miss = (mm.group(1).strip(), x, y, tid)
        if p.get("shootingPlay") and "FreeThrow" not in ty and "free throw" not in txt.lower() and x is not None and y is not None and 0 <= num(x, -1) <= 50 and 0 <= num(y, -1) <= 47:
            shots.append([num(x), num(y), 1 if made else 0, side, val])
        kind = None
        if made and val == 3:
            kind = "3pt"
        elif made and ("Dunk" in ty or "dunk" in txt.lower() or "alley oop" in txt.lower()):
            kind = "dunk"
        elif "Block" in ty:
            kind = "blk"
        if not kind:
            continue
        h = {"id": str(p.get("id")), "ty": kind, "t": hoops_period(p, key) + " " + ((p.get("clock") or {}).get("displayValue") or ""),
             "tm": ab[tid], "side": side, "sa": num(p.get("awayScore")), "sh": num(p.get("homeScore")), "txt": txt[:200]}
        if x is not None and y is not None:
            h["x"], h["y"] = num(x), num(y)
        if kind == "blk":
            m = P_BLK.search(txt)
            if m:
                h["by"], h["vs"] = m.group(1).strip(), m.group(2).strip()
            else:
                m = P_BLK2.search(txt)
                if m:
                    h["by"] = m.group(1).strip()
            # the blocked shot is the miss just before (or right after) the block
            mv = miss if (miss and miss[3] != tid) else prev_miss
            if mv and mv[3] != tid:
                h.setdefault("vs", mv[0])
                if mv[1] is not None and (h.get("x"), h.get("y")) in ((25, 0), (None, None)):
                    h["x"], h["y"] = num(mv[1]), num(mv[2])
        else:
            m = P_MAKE.search(txt)
            if m:
                h["by"] = m.group(1).strip()
                if m.group(2):
                    h["ft"] = num(m.group(2))
                if m.group(4):
                    h["ast"] = m.group(4).strip()
        hl.append(h)
    rp = []
    for p in (s.get("plays") or [])[-16:]:
        tid = str((p.get("team") or {}).get("id"))
        rp.append({"id": str(p.get("id")), "t": hoops_period(p, key) + " " + ((p.get("clock") or {}).get("displayValue") or ""),
                   "ty": ((p.get("type") or {}).get("text") or ""), "tx": (p.get("text") or "").strip()[:200], "tm": ab.get(tid, ""),
                   "sc": bool(p.get("scoringPlay")), "v": num(p.get("scoreValue")), "sa": num(p.get("awayScore")), "sh": num(p.get("homeScore"))})
    return shots[-90:], hl[-30:], rp


def ufc_card():
    """Next or current UFC event: bouts with fighters, records, flags, status and results."""
    sb = get(BASE + "mma/ufc/scoreboard")
    evs = sb.get("events") or []
    if not evs:
        return None
    ev = evs[0]
    bouts = []
    for c in ev.get("competitions") or []:
        st = (c.get("status") or {})
        t = st.get("type") or {}
        fs = []
        for f in sorted(c.get("competitors") or [], key=lambda z: num(z.get("order"))):
            a = f.get("athlete") or {}
            rec = next((r.get("summary") for r in f.get("records") or [] if r.get("type") == "total"), None)
            fs.append({"n": a.get("displayName") or a.get("fullName") or "?", "r": rec, "fl": ((a.get("flag") or {}).get("href")),
                       "ct": ((a.get("flag") or {}).get("alt")), "w": bool(f.get("winner"))})
        bouts.append({"id": str(c.get("id")), "wc": ((c.get("type") or {}).get("abbreviation")), "date": c.get("date"),
                      "state": t.get("state"), "det": t.get("shortDetail") or t.get("detail"), "rd": num(st.get("period")),
                      "clk": st.get("displayClock"), "f": fs})
    bouts.sort(key=lambda b: b.get("date") or "")
    return {"id": str(ev.get("id")), "name": ev.get("name"), "date": ev.get("date"),
            "state": ((ev.get("status") or {}).get("type") or {}).get("state"),
            "venue": (((ev.get("competitions") or [{}])[0].get("venue") or {}).get("fullName")), "bouts": bouts}


PRE_HOURS = 7 * 24      # pregame projections for every upcoming game on the scoreboard (NFL/CFB: this week, hoops: today)
PRE_REFRESH = 3 * 3600  # re-ask ESPN for a pregame projection at most this often
PREV_WP = {}


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
        ta, th = away.get("team") or {}, home.get("team") or {}
        if st == "scheduled":
            pre = pregame(key, path, ev, ta, th, away, home)
            if pre:
                games.append(pre)
            continue
        stt = ev.get("status") or {}
        g = {
            "lg": key, "id": str(ev.get("id")),
            "a": ta.get("abbreviation", "?"), "h": th.get("abbreviation", "?"),
            "an": ta.get("displayName", ta.get("abbreviation", "")), "hn": th.get("displayName", th.get("abbreviation", "")),
            "as": num(away.get("score")), "hs": num(home.get("score")),
            "status": st, "clock": stt.get("displayClock", ""), "quarter": num(stt.get("period")),
            "start": ev.get("date", ""),
        }
        g.update(team_meta(away, "a"))
        g.update(team_meta(home, "h"))
        if key in FOOTBALL and st in ("inprogress", "halftime", "closed"):
            try:
                g["scoring"], fs, g["hl"], g["rp"], g["dr"] = football_extras(path, g["id"], str(ta.get("id")), str(th.get("id")), g["a"], g["h"])
                if fs:
                    g["fs"] = fs
            except Exception as e:
                print("summary %s %s failed: %s" % (key, g["id"], e), file=sys.stderr)
        elif key not in FOOTBALL:
            bs = leaders(comp)
            if bs:
                g["bs"] = bs
            if st in ("inprogress", "halftime") or (st == "closed" and recent_start(g["start"])):
                try:
                    g["sh"], g["hl"], g["rp"] = hoops_extras(path, g["id"], key, str(ta.get("id")), str(th.get("id")), g["a"], g["h"])
                except Exception as e:
                    print("summary %s %s failed: %s" % (key, g["id"], e), file=sys.stderr)
        g.update(live_wp(comp, g, str(th.get("id")), st))
        games.append(g)
    return games


def live_wp(comp, g, h_id, st):
    if st in ("closed", "complete"):
        if g["as"] == g["hs"]:
            return {}
        out = {"wp": 100.0 if g["hs"] > g["as"] else 0.0, "wps": "final"}
        line = wp_series(SUMMARIES[g["id"]]) if g["id"] in SUMMARIES else []
        if len(line) > 1:
            out["wpl"] = line
        return out
    s = SUMMARIES.get(g["id"])
    if s:
        v, src = win_prob(s, h_id)
        if v is not None:
            out = {"wp": v, "wps": src}
            line = wp_series(s)
            if len(line) > 1:
                out["wpl"] = line
            return out
    lp = ((comp.get("situation") or {}).get("lastPlay") or {}).get("probability") or {}
    v = pct(lp.get("homeWinPercentage"))
    return {"wp": v, "wps": "live"} if v is not None else {}


def pregame(key, path, ev, ta, th, away, home):
    """A scheduled game starting soon, with ESPN's pregame win projection (cached between passes)."""
    try:
        start = datetime.datetime.fromisoformat(ev.get("date", "").replace("Z", "+00:00"))
    except ValueError:
        return None
    now = datetime.datetime.now(datetime.timezone.utc)
    if not (0 <= (start - now).total_seconds() <= PRE_HOURS * 3600):
        return None
    g = {"lg": key, "id": str(ev.get("id")), "a": ta.get("abbreviation", "?"), "h": th.get("abbreviation", "?"),
         "an": ta.get("displayName", ""), "hn": th.get("displayName", ""), "as": 0, "hs": 0,
         "status": "scheduled", "start": ev.get("date", "")}
    g.update(team_meta(away, "a"))
    g.update(team_meta(home, "h"))
    old = PREV_WP.get(g["id"])
    if old and time.time() - old.get("t", 0) < PRE_REFRESH:
        g.update({"wp": old["h"], "wps": "pre", "wpt": old["t"]})
        return g
    try:
        v, src = win_prob(get(BASE + path + "/summary?event=" + g["id"]), str(th.get("id")))
    except Exception as e:
        print("pregame %s %s failed: %s" % (key, g["id"], e), file=sys.stderr)
        v = None
    if v is None:
        return None
    g.update({"wp": v, "wps": "pre", "wpt": int(time.time())})
    return g


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "/tmp/vault_live"
    os.makedirs(out_dir, exist_ok=True)
    fetched, games = [], []
    try:
        with open(os.path.join(out_dir, "scores.json")) as f:
            for v in (json.load(f).get("wp") or {}).values():
                if v.get("s") == "pre" and v.get("id"):
                    PREV_WP[str(v["id"])] = v
    except Exception:
        pass
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
    ufc = None
    try:
        ufc = ufc_card()
        print("ufc: %s" % ((ufc or {}).get("name")))
    except Exception as e:
        print("ufc failed: %s" % e, file=sys.stderr)
    with open(os.path.join(out_dir, "pass.json"), "w") as f:
        json.dump({"fetched": fetched, "games": games, "ufc": ufc,
                   "at": datetime.datetime.now(datetime.timezone.utc).isoformat()}, f)


if __name__ == "__main__":
    main()
