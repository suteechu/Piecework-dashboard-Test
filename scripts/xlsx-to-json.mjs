import fs from 'node:fs'
import path from 'node:path'
import xlsx from 'xlsx'

const [,, inputPath, outputPath] = process.argv
if(!inputPath || !outputPath){
  console.error('Usage: node scripts/xlsx-to-json.mjs <input.xlsx> <output.json>')
  process.exit(1)
}

const wb = xlsx.readFile(inputPath, { cellDates: true })
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = xlsx.utils.sheet_to_json(sheet, { defval: null })

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8')
console.log(`✅ Wrote ${rows.length} rows to ${outputPath}`)
