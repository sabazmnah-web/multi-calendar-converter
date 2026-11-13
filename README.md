# 📅 Multi-Calendar Converter

A polyglot, multi-calendar date conversion tool that translates Gregorian dates into 5 historical and cultural calendars (and vice versa). 

This project uses a **1 + 3 architecture**, meaning one main Python controller coordinates three language workers to calculate exact Julian Day Numbers (JDN) and convert them across different calendar systems.

## 🏗️ Architecture

*   **`main.py` (Python)**: The main entry point and CLI controller. It calculates the universal JDN and coordinates the worker scripts.
*   **`solar_calendars.js` (JavaScript)**: Worker that converts the JDN into the Julian, Coptic, and Ancient Egyptian calendars.
*   **`lunar_bengali.ts` (TypeScript)**: Worker that converts the date into the Hijri (Tabular Islamic) and Bengali (Revised 2019 Bangladesh rules) calendars.
*   **`server.py` & `index.html`**: A lightweight Flask web server and UI for browser-based conversions.

## ✨ Features

*   **Bi-directional Conversion**: Convert from Gregorian to any calendar, OR convert from any calendar back to Gregorian.
*   **Astronomical Accuracy**: Uses the standard Julian Day Number (JDN) at noon as the universal baseline.
*   **2019 Bengali Rules**: Accurately applies the post-2019 Bangla Academy revision (Ashshin = 31 days, Falgun = 30 days on leap years).
*   **Tabular Hijri**: Uses the standard arithmetic Tabular Islamic formula.
*   **Ancient Egyptian**: Strict 365-day wandering year (no leap years), mapped to the Nabonassar Era.
*   **CI/CD Pipeline**: Includes a GitHub Actions workflow to automatically test conversions on every push.

## 🚀 How to Run (CLI)

You must have **Python 3.11+** and **Node.js 18+** installed.

```bash
# Convert from Gregorian to all calendars
python main.py --gregorian 2024 3 11

# Reverse conversion: Find the Gregorian date for 1 Ramadan 1445
python main.py --hijri 1445 9 1

# Reverse conversion: Find the Gregorian date for 1 Falgun 1430 (Bengali)
python main.py --bengali 1430 11 1

# Run without arguments to get today's date in all calendars
python main.py
