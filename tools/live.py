#!/usr/bin/env python3
"""VAULT live merge. Reads $VAULT_LIVE_DIR/pass.json (default /tmp/vault_live) (one pass of sports data, written by the live loop),
merges it with the previous plays.json/scores.json in /tmp/vault_live, and writes fresh scores.json and plays.json.
Prints one line: CHANGED or SAME, plus counts.

pass.json shape:
{"fetched":["nfl","ncaamb",...],               # leagues fetched this pass
 "games":[{"lg":"nfl|ncaafb|nba|ncaamb","id":"<sportradar game id>",
           "a":"CHI","h":"DET","an":"Chicago Bears","hn":"Detroit Lions",
           "as":10,"hs":10,"status":"inprogress|halftime|closed|complete|...",
           "clock":"4:07","quarter":2,"start":"2026-11-26T18:00:00+00:00",
           # optional, from game_stats (football):
           "scoring":["Q2 4:11: K.Monangai rushed up the middle for 1 yard. TOUCHDOWN. (DET 10-9 CHI)", ...],
           "fs":{"a":{"to":1,"lr":46,"lc":33,"yds":182},"h":{"to":0,"lr":12,"lc":28,"yds":195}},
           # optional, from game_stats (basketball):
           "bs":{"a":{"ld":"Latrell Davis","pts":11},"h":{"ld":"D.J. Wagner","pts":10}}}]}
  to = lost_fumbles + interceptions thrown, lr = rushing.longest, lc = receiving.longest, yds = summary.total_yards
"""
import json, os, re, datetime, sys

D = os.environ.get("VAULT_LIVE_DIR", "/tmp/vault_live")
SRC = os.environ.get("VAULT_SRC", "Sportradar via VAULT data feed")
META = ("alg", "hlg", "ac", "hc", "ac2", "hc2", "ar", "hr")
LG = {"nfl": "NFL", "ncaafb": "CFB", "nba": "NBA", "ncaamb": "CBB"}
FOOT = {"NFL", "CFB"}


def load(p, d):
    try:
        with open(os.path.join(D, p)) as f:
            return json.load(f)
    except Exception:
        return d


def gid(lg, a, h):
    return re.sub(r"[^a-z0-9-]", "", (lg + "-" + a + "-" + h).lower())


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def st_text(g, lg):
    s = g.get("status", "")
    if s == "halftime":
        return "HALFTIME"
    if s != "inprogress":
        return None
    c = str(g.get("clock") or "")
    c = re.sub(r"^0(\d:)", r"\1", c)
    if lg in FOOT and g.get("quarter"):
        q = int(g["quarter"])
        return "LIVE " + ("OT" if q > 4 else "Q%d" % q) + " " + c
    return "LIVE " + c


def period(g, lg):
    q = g.get("quarter")
    if lg in FOOT and q:
        return ("OT" if int(q) > 4 else "Q%d" % int(q))
    return "H" if g.get("status") == "halftime" else ""


def parse_scoring(line, a, h):
    m = re.match(r"^(\S+)\s+(\d{1,2}:\d{2}):\s*(.*)$", line.strip())
    t, x = (m.group(1) + " " + m.group(2), m.group(3)) if m else ("", line.strip())
    sc = {}
    m2 = re.search(r"\((\w+)\s+(\d+)-(\d+)\s+(\w+)\)\s*$", x)
    if m2:
        sc = {m2.group(1): int(m2.group(2)), m2.group(4): int(m2.group(3))}
        x = x[: m2.start()].strip()
    u = x.upper()
    x = re.sub(r"\s*\[[^\]]*\]\s*$", "", x)  # ESPN play-type tag, used only to classify
    if "TOUCHDOWN" in u:
        k, big = "td", True
    elif "SAFETY" in u:
        k, big = "sf", True
    elif "FIELD GOAL" in u:
        k, big = "fg", False
    elif "TWO-POINT" in u or "TWO POINT" in u:
        k, big = "2pt", False
    elif "EXTRA POINT" in u:
        k, big = "xp", False
    else:
        k, big = "score", False
    return t, x, sc, k, big


def go_ahead(h):
    """A made three that tied the game or took the lead."""
    if h.get("ty") != "3pt":
        return False
    mine, theirs = (h.get("sa", 0), h.get("sh", 0)) if h.get("side") == "a" else (h.get("sh", 0), h.get("sa", 0))
    return mine - 3 < theirs <= mine


def headline(h):
    yd = h.get("yd", 0)
    if h["ty"] == "pass" and h.get("qb") and h.get("rc"):
        return "%s to %s for %d yards%s." % (h["qb"], h["rc"], yd, ", TOUCHDOWN" if h.get("td") else "")
    if h["ty"] in ("rush", "ret") and h.get("by"):
        return "%s %s %d yards%s." % (h["by"], "breaks off" if h["ty"] == "rush" else "returns it", yd, " for the TOUCHDOWN" if h.get("td") else "")
    if h["ty"] == "int":
        return "INTERCEPTED%s%s." % (" by " + h["by"] if h.get("by") else "", " on a pass from " + h["qb"] if h.get("qb") else "")
    if h["ty"] == "3pt":
        return "%s drills a %sthree%s." % (h.get("by") or h["tm"], ("%d-foot " % h["ft"]) if h.get("ft") else "", (" (assist: %s)" % h["ast"]) if h.get("ast") else "")
    if h["ty"] == "dunk":
        return "%s throws it down%s." % (h.get("by") or h["tm"], (" off a feed from %s" % h["ast"]) if h.get("ast") else "")
    if h["ty"] == "blk":
        return "%s rejects %s." % (h.get("by") or h["tm"], h.get("vs") or "the shot")
    if h["ty"] == "fum":
        return "Fumble! %s take it away." % h["def"]
    return h.get("txt", "Big play")


def main():
    p = load("pass.json", None)
    if not p:
        print("NO_PASS")
        sys.exit(1)
    prev_scores = load("scores.json", {"games": []})
    plays = load("plays.json", {"games": {}})
    P = plays.setdefault("games", {})
    fetched = {LG.get(x, x.upper()) for x in p.get("fetched", [])}
    now = datetime.datetime.now(datetime.timezone.utc)

    out = []
    for g in p.get("games", []):
        lg = LG.get(g["lg"], g["lg"].upper())
        s = g.get("status", "")
        live = s in ("inprogress", "halftime")
        recent = False
        if s in ("closed", "complete") and g.get("start"):
            try:
                st0 = datetime.datetime.fromisoformat(g["start"].replace("Z", "+00:00"))
                recent = (now - st0).total_seconds() < 6 * 3600
            except Exception:
                recent = False
        if not (live or recent):
            continue
        row = {"lg": lg, "a": g["a"], "as": int(g["as"]), "h": g["h"], "hs": int(g["hs"]), "an": g.get("an", g["a"]), "hn": g.get("hn", g["h"])}
        for mk in META:
            if g.get(mk):
                row[mk] = g[mk]
        t = st_text(g, lg)
        if t:
            row["st"] = t
        out.append((live, row, g))

    # keep games from leagues we did not fetch this pass
    have = {gid(r["lg"], r["a"], r["h"]) for _, r, _ in out}
    for r in prev_scores.get("games", []):
        if r.get("lg") not in fetched and gid(r["lg"], r["a"], r["h"]) not in have:
            out.append((bool(r.get("st")), r, None))
    out.sort(key=lambda x: not x[0])
    scores = {"updatedAt": now_iso(), "src": SRC, "games": [r for _, r, _ in out]}
    ufc = p.get("ufc") if "ufc" in p else prev_scores.get("ufc")
    if ufc:
        scores["ufc"] = ufc

    prev_by = {gid(r["lg"], r["a"], r["h"]): r for r in prev_scores.get("games", [])}
    for live, r, g in out:
        if g is None:
            continue
        lg, a, h = r["lg"], r["a"], r["h"]
        k = gid(lg, a, h)
        e = P.setdefault(k, {"lg": lg, "a": a, "h": h, "an": r["an"], "hn": r["hn"], "plays": [], "fs": None})
        e.update({"as": r["as"], "hs": r["hs"], "st": r.get("st", "FINAL"), "id": g.get("id", e.get("id"))})
        e.update({mk: r[mk] for mk in META if r.get(mk)})
        pl = e["plays"]
        keys = {x.get("key") for x in pl}

        def add(item):
            if item["key"] in keys:
                return
            item["at"] = now_iso()
            pl.append(item)
            keys.add(item["key"])

        if lg in FOOT:
            last = {a: 0, h: 0}
            for line in g.get("scoring") or []:
                tt, x, sc, kind, big = parse_scoring(line, a, h)
                tm = None
                if sc:
                    for team in (a, h):
                        if sc.get(team, 0) > last.get(team, 0):
                            tm = team
                    last.update({kk: v for kk, v in sc.items() if kk in last})
                add({"key": "s|" + line.strip(), "t": tt, "x": x, "tm": tm, "k": kind, "big": big,
                     "sa": sc.get(a), "sh": sc.get(h)})
            # highlight plays with names + field spots (ESPN drives). Scoring highlights attach to the scoring row.
            for hh in g.get("hl") or []:
                tgt = None
                if hh.get("sk"):
                    tgt = next((it for it in pl if it.get("key") == hh["sk"]), None)
                if tgt is None and (hh.get("td") or hh["ty"] == "ret"):
                    for it in pl:
                        if it.get("t") == hh["t"] and it.get("k") in ("td", "sf") and not it.get("hl"):
                            tgt = it
                            break
                if tgt is not None:
                    tgt["hl"] = hh
                    stale = "hl|" + hh["id"]
                    pl[:] = [it for it in pl if it.get("key") != stale]
                    continue
                tm = hh["def"] if hh["ty"] in ("int", "fum") else hh["off"]
                add({"key": "hl|" + hh["id"], "t": hh["t"], "x": headline(hh), "tm": tm,
                     "k": "to" if hh["ty"] in ("int", "fum") else ("td" if hh.get("td") else "big"),
                     "big": True, "hl": hh})
            fs = g.get("fs")
            old = e.get("fs")
            if "hl" in g:
                old = None  # real highlights replace the team-stat guesses below
            if fs and old:
                per = period(g, lg)
                clk = re.sub(r"^0(\d:)", r"\1", str(g.get("clock") or ""))
                for side, team, opp in (("a", a, h), ("h", h, a)):
                    n, o = fs.get(side) or {}, old.get(side) or {}
                    if n.get("to", 0) > o.get("to", 0):
                        add({"key": "to|%s|%d" % (team, n["to"]), "t": (per + " " + clk).strip(), "x": "Turnover! %s take it away from the %s (%s turnover #%d)." % (r["hn"] if side == "a" else r["an"], r["an"] if side == "a" else r["hn"], team, n["to"]),
                             "tm": opp, "k": "to", "big": True})
                    for stat, word in (("lr", "run"), ("lc", "catch")):
                        nv, ov = n.get(stat, 0) or 0, o.get(stat, 0) or 0
                        if nv > ov and nv >= 25:
                            add({"key": "%s|%s|%d" % (stat, team, nv), "t": (per + " " + clk).strip(), "x": "Explosive play: %d-yard %s for %s, their longest of the game." % (nv, word, r["an"] if side == "a" else r["hn"]),
                                 "tm": team, "k": "big", "big": True})
            if fs:
                e["fs"] = fs
        else:
            pa, ph = (prev_by.get(k) or {}).get("as"), (prev_by.get(k) or {}).get("hs")
            if pa is not None and (r["as"], r["hs"]) != (pa, ph):
                da, dh = r["as"] - pa, r["hs"] - ph
                clk = (r.get("st") or "").replace("LIVE ", "")
                if da > 0 and dh <= 0 or dh > 0 and da <= 0:
                    team = a if da > 0 else h
                    pts = max(da, dh)
                    add({"key": "run|%s|%d|%d" % (team, r["as"], r["hs"]), "t": clk, "x": "%s %d-0 burst (%s %d, %s %d)." % (r["an"] if team == a else r["hn"], pts, a, r["as"], h, r["hs"]),
                         "tm": team, "k": "run", "big": pts >= 7, "sa": r["as"], "sh": r["hs"]})
                elif da > 0 and dh > 0:
                    add({"key": "trade|%d|%d" % (r["as"], r["hs"]), "t": clk, "x": "Trading baskets: %s scores %d, %s scores %d (%s %d, %s %d)." % (a, da, h, dh, a, r["as"], h, r["hs"]),
                         "tm": None, "k": "score", "big": False, "sa": r["as"], "sh": r["hs"]})
            if g.get("bs"):
                e["bs"] = g["bs"]
            if g.get("sh"):
                e["sh"] = g["sh"]
            for hh in g.get("hl") or []:
                add({"key": "hl|" + hh["id"], "t": hh["t"], "x": headline(hh), "tm": hh["tm"],
                     "k": {"3pt": "three", "dunk": "dunk", "blk": "block"}.get(hh["ty"], "big"),
                     "big": hh["ty"] == "dunk" or go_ahead(hh), "hl": hh})
        if g.get("status") == "halftime":
            add({"key": "half", "t": "Half", "x": "Halftime: %s %d, %s %d." % (r["an"], r["as"], r["hn"], r["hs"]), "tm": None, "k": "half", "big": False})
        if g.get("status") in ("closed", "complete"):
            w = r["an"] if r["as"] > r["hs"] else r["hn"]
            add({"key": "final", "t": "Final", "x": "Final: %s win %d-%d." % (w, max(r["as"], r["hs"]), min(r["as"], r["hs"])) if r["as"] != r["hs"] else "Final: tied %d-%d." % (r["as"], r["hs"]),
                 "tm": a if r["as"] > r["hs"] else h if r["hs"] > r["as"] else None, "k": "final", "big": True})
        e["plays"] = pl[-80:]

    # drop games we no longer show
    keep = {gid(r["lg"], r["a"], r["h"]) for r in scores["games"]}
    for k in list(P.keys()):
        if k not in keep:
            del P[k]
    plays["updatedAt"] = now_iso()

    def core(x):
        return json.dumps({k: v for k, v in x.items() if k != "updatedAt"}, sort_keys=True, default=str)

    changed = core(scores) != core(prev_scores) or core(plays) != core(load("plays.json", {}))
    with open(os.path.join(D, "scores.json"), "w") as f:
        json.dump(scores, f, separators=(",", ":"))
    with open(os.path.join(D, "plays.json"), "w") as f:
        json.dump(plays, f, separators=(",", ":"))
    nlive = sum(1 for r in scores["games"] if r.get("st"))
    nplays = sum(len(v["plays"]) for v in P.values())
    print(("CHANGED" if changed else "SAME") + " live=%d games=%d plays=%d" % (nlive, len(scores["games"]), nplays))


if __name__ == "__main__":
    main()
