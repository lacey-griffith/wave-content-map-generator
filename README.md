# Wave ContentMap Generator

This Node.js script generates a `contentMap.js` object used in Convert deployments by importing a client-provided CSV.

---

## 📥 Input Format

Export the Excel file as a **CSV (Comma-Separated Values)** file named: WaveUrls.csv


It must contain:

| Column Name | Example                            | Description                              |
|-------------|------------------------------------|------------------------------------------|
| `Opus2`     | `/lexington/`                      | Local homepage URL (target page)         |
| `Wave`      | `/locations/kentucky/lexington/`   | Source WAVE page (used to fetch content) |

> ⚠️ Be sure the CSV uses a **comma `,` as the delimiter** — not a tab or semicolon.

---

## 🚀 How to Use
1. Drop the CSV file into the root of this repo.
2. Run the generator:

```bash
node generateContentMap.js
