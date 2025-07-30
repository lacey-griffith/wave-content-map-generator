# 🗺️ Wave ContentMap Generator

This Node.js script generates a `contentMap.js` object used for Convert deployments. It maps Opus2 (local homepage) URLs to WAVE source pages, based on a CSV file exported from Excel.  
Built to reduce manual work, prevent formatting errors, and make it easy to scale across hundreds of locations.

---

## Input Format

1. Export the Excel file as a **CSV (Comma-Separated Values)** file named:

```bash
WaveUrls.csv
```

> ⚠️ File name **must be exactly** `WaveUrls.csv`.  
> Common trip-up: Excel or Google Sheets may download the file as `WaveUrls(Sheet1).csv` — rename it before using!

---

## Required Columns

```csv
Wave,Opus2
/locations/kentucky/lexington/,/lexington/
/locations/ohio/toledo/,/toledo/
```

| Column | Column Name | Example                          | Description                              |
|--------|-------------|----------------------------------|------------------------------------------|
| A      | `Wave`      | `/locations/kentucky/lexington/` | Source WAVE page (used to fetch content) |
| B      | `Opus2`     | `/lexington/`                    | Local homepage URL (target page)         |

> ⚠️ Be sure your CSV uses a **comma `,` as the delimiter** — not a tab or semicolon.  
> You can open it in VS Code or a text editor to verify.

---

## How to Use

1. **Drop the CSV file into the root of this repo.**
   - ⚠️ It must be named `WaveUrls.csv`.
   - From terminal, move it from your Downloads folder:

```bash
mv ~/Downloads/WaveUrls.csv .
```

2. **Run the generator:**

```bash
npm run gen
```

Or if you're running it directly:

```bash
node generateContentMap.js
```

---

## What the Script Does

- ✅ Normalizes column headers (case- and space-insensitive)
- ✅ Trims whitespace from paths
- ✅ Adds trailing slashes if missing
- ⚠️ Warns and skips rows with missing values
- ⚠️ Warns if `contentMap.js` already exists (then overwrites it)
- ⚠️ Warns on duplicate `Opus2` keys
- 📊 Displays a summary of how many URLs were successfully mapped

---

## Output

After running, a `contentMap.js` file will be created in the repo root:

```js
const contentMap = {
  "/lexington/": {
    sourcePage: "/locations/kentucky/lexington/"
  },
  "/toledo/": {
    sourcePage: "/locations/ohio/toledo/"
  }
};

export default contentMap;
```

>You can now import or paste this object into your Convert deployment script.

---

## 💡 Tips & Common Trip-Ups

- ❌ **CSV file is named incorrectly** (e.g., `WaveUrls(Sheet1).csv`)  
  → ✅ Rename it to `WaveUrls.csv`

- ❌ **CSV has hidden rows or trailing blank lines**  
  → ✅ These are automatically skipped, but you’ll see this in the terminal:  
  `⚠️  Skipping row with missing values`

- ❌ **Headers are formatted differently** (e.g., `wave`, `OPUS2`, etc.)  
  → ✅ No worries — the script handles headers case-insensitively

- ❌ **Wrong delimiter used** (tabs or semicolons)  
  → ✅ Re-export the Excel file as **CSV (Comma delimited) (.csv)**

---

## Need Help?

If you’re unsure how to export your CSV, run the tool, or modify it for another format — open an issue or reach out.

This script was designed to be easy to hand off and extend.
