from flask import Flask, request, jsonify, send_from_directory
import main

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api')
def convert():
    calendar = request.args.get('calendar')
    try:
        y = int(request.args.get('year'))
        m = int(request.args.get('month'))
        d = int(request.args.get('day'))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid date format"}), 400

    if calendar == 'gregorian':
        jdn = main.gregorian_to_jdn(y, m, d)
    else:
        payload = {"mode": "reverse", "calendar": calendar, "year": y, "month": m, "day": d}
        worker = main.call_node if calendar in main.SOLAR else main.call_tsx
        try:
            jdn = worker(payload)["jdn"]
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    g = main.jdn_to_gregorian(jdn)
    solar = main.call_node({"mode": "forward", "jdn": jdn, "gregorian": g})
    lunar = main.call_tsx({"mode": "forward", "jdn": jdn, "gregorian": g})

    return jsonify({
        "jdn": jdn,
        "gregorian": f"{g['day']:02d}-{g['month']:02d}-{g['year']}",
        "julian": solar['julian'],
        "bengali": lunar['bengali'],
        "hijri": lunar['hijri'],
        "coptic": solar['coptic'],
        "egyptian": solar['egyptian']
    })

if __name__ == '__main__':
    app.run(port=5000)
