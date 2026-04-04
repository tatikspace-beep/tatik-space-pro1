import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'client/src/lib/i18n.ts');
const content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
const keysByLanguage = {};

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match: key: "value"
    const keyMatch = line.match(/^\s*(\w+):\s*"([^"]*)"/);
    if (keyMatch) {
        const key = keyMatch[1];
        const value = keyMatch[2];

        // Find which language this belongs to by looking backwards
        let lang = null;
        for (let j = i; j >= 0; j--) {
            const langLineMatch = lines[j].match(/^\s*(\w+):\s*{/);
            if (langLineMatch && j > 5) {
                lang = langLineMatch[1];
                break;
            }
            if (lines[j].trim() === '};') {
                break;
            }
        }

        if (!lang) continue;

        if (!keysByLanguage[lang]) {
            keysByLanguage[lang] = {};
        }

        const lineNum = i + 1;

        if (keysByLanguage[lang][key]) {
            // Found duplicate
            console.log(`\n[${lang}] DUPLICATE: "${key}"`);
            console.log(`  Line ${keysByLanguage[lang][key].line}: "${keysByLanguage[lang][key].value}"`);
            console.log(`  Line ${lineNum}: "${value}"`);
        } else {
            keysByLanguage[lang][key] = { line: lineNum, value: value };
        }
    }
}

console.log(`\n=== Summary ===`);
console.log(`Languages analyzed: ${Object.keys(keysByLanguage).length}`);
