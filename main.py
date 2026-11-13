import subprocess, json, argparse, shutil, os
from datetime import datetime

NODE = shutil.which("node") or "node"
NPX  = shutil.which("npx")  or "npx"

SOLAR = {"julian", "coptic", "egyptian"}
LUNAR = {"hijri",  "bengali"}


def gregorian_to_jdn(y, m, d):
    a = (14 - m) // 12
    y += 4800 - a
    m += 12 * a - 3
    return d + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045


def jdn_to_gregorian(jdn):
    a = jdn + 32044
    b = (4 * a + 3) // 146097
    c = a - (146097 * b) // 4
    d = (4 * c + 3) // 1461
    e = c - (1461 * d) // 4
    m = (5 * e + 2) // 153
    return {
        "day":   e - (153 * m + 2) // 5 + 1,
        "month": m + 3 - 12 * (m // 10),
        "year":  100 * b + d - 4800 + m // 10,
    }


def call_node(payload):
    res = subprocess.run([NODE, "solar_calendars.js", json.dumps(payload)],
                         capture_output=True, text=True, check=True)
    return json.loads(res.stdout.strip())


def call_tsx(payload):
    res = subprocess.run([NPX, "--yes", "tsx", "lunar_bengali.ts", json.dumps(payload)],
                         capture_output=True, text=True, check=True)
    return json.loads(res.stdout.strip())


def resolve_jdn(args):
    if args.jdn is not None:
        return args.jdn
    if args.gregorian:
        return gregorian_to_jdn(*args.gregorian)
    for cal in SOLAR | LUNAR:
        val = getattr(args, cal, None)
        if val:
            payload = {"mode": "reverse", "calendar": cal,
                       "year": val[0], "month": val[1], "day": val[2]}
            worker = call_node if cal in SOLAR else call_tsx
            return worker(payload)["jdn"]
    n = datetime.now()
    return gregorian_to_jdn(n.year, n.month, n.day)


def main():
    p = argparse.ArgumentParser(description="Multi-calendar converter")
    for name in ["gregorian", "julian", "coptic", "egyptian", "hijri", "bengali"]:
        p.add_argument(f"--{name}", nargs=3, type=int, metavar=("Y", "M", "D"))
    p.add_argument("--jdn", type=int)
    args = p.parse_args()

    jdn = resolve_jdn(args)
    g   = jdn_to_gregorian(jdn)

    solar = call_node({"mode": "forward", "jdn": jdn, "gregorian": g})
    lunar = call_tsx ({"mode": "forward", "jdn": jdn, "gregorian": g})

    print(f"JDN:              {jdn}")
    print(f"Gregorian:        {g['day']:02d}-{g['month']:02d}-{g['year']}")
    print(f"Julian:           {solar['julian']}")
    print(f"Bengali (BD):     {lunar['bengali']}")
    print(f"Hijri (Tabular):  {lunar['hijri']}")
    print(f"Coptic:           {solar['coptic']}")
    print(f"Ancient Egyptian: {solar['egyptian']}")


if __name__ == "__main__":
    main()
