# Wave ContentMap Generator

This Node.js script generates a `contentMap.js` object used for a Convert deployment. The contentMap can be created by importing a client-provided CSV using the following formatting criteria.

---

## 📥 Input Format
1. Export the Excel file as a **CSV (Comma-Separated Values)** file named: WaveUrls.csv
>⚠️ File name MUST be WaveUrls.csv -- when downloading, ensure it doesn't change to WaveUrls(Sheet1).csv ⚠️

It must contain:

| Column Name | Example                            | Description                              |
|-------------|------------------------------------|------------------------------------------|
| `Opus2`     | `/lexington/`                      | Local homepage URL (target page)         |
| `Wave`      | `/locations/kentucky/lexington/`   | Source WAVE page (used to fetch content) |

> ⚠️ Be sure the CSV uses a **comma `,` as the delimiter** — not a tab or semicolon. ⚠️

---

## 🚀 How to Use
1. Drop the CSV file into the root of this repo. (⚠️ Be sure the file is named WaveUrls.csv ⚠️)
Use the terminal to move it from downloads - mv ~/Downloads/WaveUrls.csv .   

2. Run the generator:
npm run gen
OR npm run generator
OR node generateContentMap.js
