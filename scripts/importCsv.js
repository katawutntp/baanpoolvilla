// Script to import houses from CSV to Firebase
// Run: node scripts/importCsv.js

const fs = require('fs');
const path = require('path');

const CSV_PATH = path.resolve(__dirname, '../../../poolvilla database.csv');
const API_URL = 'http://localhost:3001/api/import';

function* parseCSVGenerator(content) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  let fields = [];

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '"') {
      if (inQuotes && i + 1 < content.length && content[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else if ((char === '\n' || (char === '\r')) && !inQuotes) {
      fields.push(current);
      current = '';
      if (fields.some(f => f.trim())) {
        yield fields;
      }
      fields = [];
      if (char === '\r' && i + 1 < content.length && content[i + 1] === '\n') {
        i++;
      }
    } else {
      current += char;
    }
  }
  if (fields.length > 0 || current.length > 0) {
    fields.push(current);
    if (fields.some(f => f.trim())) {
      yield fields;
    }
  }
}

async function main() {
  console.log('Reading CSV from:', CSV_PATH);

  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV file not found at:', CSV_PATH);
    process.exit(1);
  }

  const content = fs.readFileSync(CSV_PATH, 'utf-8');

  const rows = [...parseCSVGenerator(content)];
  const headers = rows[0];
  const dataRows = rows.slice(1);

  console.log('Headers:', headers);
  console.log(`Found ${dataRows.length} data rows`);

  // Convert to objects
  const houses = dataRows.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (row[i] || '').trim();
    });
    return obj;
  }).filter(h => h.ID && h.Title); // Only rows with ID and Title

  console.log(`Parsed ${houses.length} valid houses:`);
  houses.forEach((h, i) => {
    console.log(`  ${i + 1}. [${h.ID}] ${h.Title} (${h['พื้นที่']})`);
  });

  console.log('\nImporting to Firebase via API...');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      houses,
      clearExisting: true,
    }),
  });

  const result = await res.json();

  if (res.ok) {
    console.log('\n✅ Import successful!');
    console.log(`   Imported ${result.houses.length} houses:`);
    result.houses.forEach((h) => {
      console.log(`   - ${h.name} (code: ${h.code}, id: ${h.id})`);
    });
  } else {
    console.error('\n❌ Import failed:', result);
  }
}

main().catch(console.error);
