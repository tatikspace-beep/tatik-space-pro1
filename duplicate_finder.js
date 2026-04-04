import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'client/src/lib/i18n.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// Split into lines
const lines = content.split('\n');

// Find all language blocks more carefully
const languageBlocks = {};
let currentLang = null;
let blockStart = 0;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match language block start: "en: {", "it: {", etc.
    const langMatch = line.match(/^\s*(\w+):\s*{/);
    if (langMatch && i > 5) { // Skip the first "{" which is the main translations object
        currentLang = langMatch[1];
        blockStart = i;
        console.log(`Found language block: ${currentLang} at line ${i + 1}`);
    }
}

// Now analyze for duplicates in each language more directly
const keysByLanguage = {};

for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match: key: "value"
    const keyMatch = line.match(/^(\w+):\s*"([^"]*)"/);
    if (keyMatch) {
        const key = keyMatch[1];
        const value = keyMatch[2];

        // Try to figure out which language this belongs to
        // by looking backwards for the language block
        let lang = null;
        for (let j = i; j >= 0; j--) {
            const langLineMatch = lines[j].match(/^\s*(\w+):\s*{/);
            if (langLineMatch && j > 5) {
                lang = langLineMatch[1];
                break;
            }
            if (lines[j].trim() === '};') {
                break; // Hit the end of translations object
            }
        }

        if (!lang) continue;

        if (!keysByLanguage[lang]) {
            keysByLanguage[lang] = {};
        }

        const lineNum = i + 1;

        if (keysByLanguage[lang][key]) {
            // Duplicate found!
            console.log(`\n[${lang}] DUPLICATE KEY: "${key}"`);
            console.log(`  First occurrence at line ${keysByLanguage[lang][key].line}: ${keysByLanguage[lang][key].value}`);
            console.log(`  Second occurrence at line ${lineNum}: ${value}`);
        } else {
            keysByLanguage[lang][key] = { line: lineNum, value: value };
        }
    }
}

// Summary
let duplicateCount = 0;
for (const lang of Object.keys(keysByLanguage)) {
    const langKeys = keysByLanguage[lang];
    const uniqueKeys = new Set();

    for (const key of Object.keys(langKeys)) {
        if (uniqueKeys.has(key)) {
            duplicateCount++;
        }
        uniqueKeys.add(key);
    }
}

console.log(`\n=== Analysis Complete ===`);
console.log(`Languages found: ${Object.keys(keysByLanguage).length}`);
if (duplicateCount === 0) {
    console.log('No duplicate keys found!');
