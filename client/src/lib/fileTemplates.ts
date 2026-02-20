// Language templates with boilerplate code
export const languageTemplates: Record<string, { extension: string; template: string }> = {
    javascript: {
        extension: 'js',
        template: `// JavaScript - Struttura Base
// Created with Tatik Space Pro

class MyClass {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(\`Hello, \${this.name}!\`);
  }

  calculate(a, b) {
    return a + b;
  }
}

// Uso
const instance = new MyClass('World');
instance.greet();
console.log('Somma: ' + instance.calculate(5, 3));

module.exports = MyClass;
`,
    },
    typescript: {
        extension: 'ts',
        template: `// TypeScript - Struttura Base con Interfaccia
// Created with Tatik Space Pro

interface IGreeter {
  name: string;
  greet(): void;
  calculate(a: number, b: number): number;
}

class Greeter implements IGreeter {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  greet(): void {
    console.log(\`Hello, \${this.name}!\`);
  }

  calculate(a: number, b: number): number {
    return a + b;
  }
}

const greeter = new Greeter('TypeScript');
greeter.greet();
console.log('Somma: ' + greeter.calculate(10, 20));

export default Greeter;
`,
    },
    python: {
        extension: 'py',
        template: `# Python - Struttura Base con Classe
# Created with Tatik Space Pro

class MyClass:
    """Classe base con metodi di esempio"""
    
    def __init__(self, name: str):
        """Inizializzatore"""
        self.name = name
    
    def greet(self) -> None:
        """Metodo di saluto"""
        print(f"Hello, {self.name}!")
    
    def calculate(self, a: int, b: int) -> int:
        """Metodo per calcolare la somma"""
        return a + b
    
    def __str__(self) -> str:
        """Rappresentazione stringa"""
        return f"MyClass({self.name})"

if __name__ == "__main__":
    obj = MyClass("Python")
    obj.greet()
    print(f"Somma: {obj.calculate(5, 3)}")
    print(obj)
`,
    },
    html: {
        extension: 'html',
        template: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Pagina creata con Tatik Space Pro">
    <title>Pagina Base</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        header {
            background: #2c3e50;
            color: white;
            padding: 1rem;
            text-align: center;
        }
        
        main {
            max-width: 1000px;
            margin: 2rem auto;
            padding: 0 1rem;
        }
        
        footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 1rem;
            margin-top: 2rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>Benvenuto</h1>
        <p>Pagina creata con Tatik Space Pro</p>
    </header>
    
    <main>
        <section>
            <h2>Sezione Principale</h2>
            <p>Questo è il contenuto principale della pagina.</p>
        </section>
        
        <section>
            <h3>Sottosezione</h3>
            <ul>
                <li>Punto 1</li>
                <li>Punto 2</li>
                <li>Punto 3</li>
            </ul>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2024 Tatik Space Pro. Tutti i diritti riservati.</p>
    </footer>
</body>
</html>
`,
    },
    css: {
        extension: 'css',
        template: `/* CSS - Struttura Layout Base */
/* Created with Tatik Space Pro */

:root {
    --color-primary: #3b82f6;
    --color-secondary: #1e40af;
    --spacing-unit: 1rem;
    --border-radius: 0.5rem;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #f5f5f5;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-unit);
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-unit);
}

.flex {
    display: flex;
    gap: var(--spacing-unit);
}

button {
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background: var(--color-secondary);
}

h1, h2, h3 {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr;
    }
    
    .flex {
        flex-direction: column;
    }
}
`,
    },
    json: {
        extension: 'json',
        template: `{
  "project": {
    "name": "My Project",
    "version": "1.0.0",
    "description": "Progetto creato con Tatik Space Pro",
    "author": "Your Name",
    "license": "MIT",
    "keywords": ["tatik", "editor", "project"]
  },
  "settings": {
    "theme": "dark",
    "language": "it",
    "autoSave": true
  },
  "dependencies": [],
  "scripts": {
    "start": "node index.js",
    "build": "npm run build"
  }
}
`,
    },
    sql: {
        extension: 'sql',
        template: `-- SQL file
-- Created with Tatik Space Pro

-- Example query
SELECT * FROM users LIMIT 10;
`,
    },
    markdown: {
        extension: 'md',
        template: `# My Document

Created with Tatik Space Pro

## Getting Started

- Point 1
- Point 2
- Point 3

## Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

## Learn More

Visit [Tatik Space](https://www.tatik.space) for more information.
`,
    },
    xml: {
        extension: 'xml',
        template: `<?xml version="1.0" encoding="UTF-8"?>
<!-- XML file -->
<!-- Created with Tatik Space Pro -->
<root>
  <item id="1">
    <name>Example</name>
    <value>123</value>
  </item>
</root>
`,
    },
    java: {
        extension: 'java',
        template: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("Created with Tatik Space Pro");
    }
}
`,
    },
    csharp: {
        extension: 'cs',
        template: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        Console.WriteLine("Created with Tatik Space Pro");
    }
}
`,
    },
    php: {
        extension: 'php',
        template: `<?php
// PHP file
// Created with Tatik Space Pro

echo "Hello, World!\\n";
echo "PHP version: " . phpversion();

?>
`,
    },
    ruby: {
        extension: 'rb',
        template: `#!/usr/bin/env ruby
# Ruby file
# Created with Tatik Space Pro

def hello
  puts "Hello, World!"
end

hello
`,
    },
    go: {
        extension: 'go',
        template: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    fmt.Println("Created with Tatik Space Pro")
}
`,
    },
    rust: {
        extension: 'rs',
        template: `fn main() {
    println!("Hello, World!");
    println!("Created with Tatik Space Pro");
}
`,
    },
    kotlin: {
        extension: 'kt',
        template: `fun main() {
    println("Hello, World!")
    println("Created with Tatik Space Pro")
}
`,
    },
    swift: {
        extension: 'swift',
        template: `import Foundation

print("Hello, World!")
print("Created with Tatik Space Pro")
`,
    },
    cpp: {
        extension: 'cpp',
        template: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    std::cout << "Created with Tatik Space Pro" << std::endl;
    return 0;
}
`,
    },
    shell: {
        extension: 'sh',
        template: `#!/bin/bash
# Bash script
# Created with Tatik Space Pro

echo "Hello, World!"
echo "Created with Tatik Space Pro"
`,
    },
    dockerfile: {
        extension: 'Dockerfile',
        template: `FROM node:18-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
`,
    },
    yaml: {
        extension: 'yaml',
        template: `# YAML file
# Created with Tatik Space Pro

version: "1.0"
name: "My Project"
description: "Example YAML configuration"

settings:
  debug: false
  port: 3000
  host: localhost
`,
    },
};

// Detect language from file extension
export function detectLanguageFromExtension(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';

    const extMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'json': 'json',
        'sql': 'sql',
        'md': 'markdown',
        'xml': 'xml',
        'java': 'java',
        'cs': 'csharp',
        'php': 'php',
        'rb': 'ruby',
        'go': 'go',
        'rs': 'rust',
        'kt': 'kotlin',
        'swift': 'swift',
        'cpp': 'cpp',
        'cc': 'cpp',
        'cxx': 'cpp',
        'sh': 'shell',
        'bash': 'shell',
        'dockerfile': 'dockerfile',
        'yaml': 'yaml',
        'yml': 'yaml',
    };

    return extMap[ext] || 'plaintext';
}

// Suggest extension based on filename (without extension)
export function suggestExtension(filename: string): {
    language: string;
    extension: string;
    template: string;
} {
    // Check if filename already has an extension
    if (filename.includes('.')) {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        const language = detectLanguageFromExtension(filename);

        if (languageTemplates[language]) {
            return {
                language,
                extension: ext,
                template: languageTemplates[language].template,
            };
        }

        // Unknown extension - return as-is
        return {
            language: 'plaintext',
            extension: ext,
            template: '',
        };
    }

    // If no extension, try to guess from common patterns
    const lower = filename.toLowerCase();

    if (/^package/.test(lower)) return getTemplate('json');
    if (/^dockerfile/.test(lower)) return getTemplate('dockerfile');
    if (/^makefile/.test(lower)) return getTemplate('shell');
    if (/^\.gitignore/.test(lower)) return getTemplate('plaintext');
    if (/\.config/.test(lower)) return getTemplate('yaml');

    // Default to javascript if no extension and no pattern match
    return getTemplate('javascript');
}

function getTemplate(
    language: string
): {
    language: string;
    extension: string;
    template: string;
} {
    const template = languageTemplates[language];
    if (template) {
        return {
            language,
            extension: template.extension,
            template: template.template,
        };
    }

    return {
        language: 'plaintext',
        extension: 'txt',
        template: '',
    };
}

// Detect programming language from code content
export function detectLanguage(code: string): string {
    if (!code.trim()) return 'plaintext';

    // JSON detection
    if (code.trim().startsWith('{') || code.trim().startsWith('[')) {
        try {
            JSON.parse(code);
            return 'json';
        } catch {
            // Not valid JSON, continue
        }
    }

    // SQL detection
    if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|WITH)\b/i.test(code)) {
        return 'sql';
    }

    // Python detection - only for import/from/def/class/if __name__ (not just ending with :)
    if (/^\s*(import|from|def\s|class\s|if\s+__name__|async\s+def)\b/i.test(code)) {
        return 'python';
    }

    // HTML/XML detection
    if (/<[!?]?[a-zA-Z]/.test(code)) {
        if (/<html|<!DOCTYPE|<body|<head/i.test(code)) {
            return 'html';
        }
        return 'xml';
    }

    // CSS detection
    if (/[a-zA-Z-]+\s*:\s*[^;]*;/.test(code)) {
        return 'css';
    }

    // Markdown detection
    if (/^#+\s|^\*\*\*|^---/.test(code)) {
        return 'markdown';
    }

    // Shell/Bash detection
    if (/^#!\/bin\/bash|^#!\/bin\/sh|^\$\s|^for |^while |^case /i.test(code)) {
        return 'shell';
    }

    // Java detection
    if (/\bpublic\s+class\b|\bimport\s+java|@Override|public\s+static\s+void\s+main/.test(code)) {
        return 'java';
    }

    // C# detection
    if (/\busing\s+System|namespace\s+\w+|public\s+class\b|public\s+async\s+Task/.test(code)) {
        return 'csharp';
    }

    // Go detection
    if (/package\s+\w+|^func\s+|import\s+\(|:=/.test(code)) {
        return 'go';
    }

    // Rust detection
    if (/^fn\s+\w+|impl\s+\w+|pub\s+fn|let\s+mut\s+/.test(code)) {
        return 'rust';
    }

    // Ruby detection
    if (/def\s+\w+\s*\(|\.each\s*{|@\w+\s*=/.test(code) || code.includes('ruby')) {
        return 'ruby';
    }

    // PHP detection
    if (/php|\$\w+\s*=|function\s+\w+\s*\(/.test(code)) {
        return 'php';
    }

    // Swift detection
    if (/^import\s+Foundation|func\s+\w+|class\s+\w+|let\s+\w+\s*:/.test(code)) {
        return 'swift';
    }

    // Kotlin detection
    if (/fun\s+\w+|class\s+\w+\s*{|val\s+\w+|var\s+\w+|\:\s+String|->/.test(code)) {
        return 'kotlin';
    }

    // C++ detection
    if (/#include\s*[<"]|std::|void\s+\w+|int\s+main|template\s*</.test(code)) {
        return 'cpp';
    }

    // TypeScript detection (must come after other detections)
    if (/interface\s+\w+|type\s+\w+\s*=|:\s*(string|number|boolean|any|interface|type|void)\b/.test(code)) {
        return 'typescript';
    }

    // JavaScript detection (default for code-like content)
    if (/\bfunction\b|\bconst\b|\blet\b|\bvar\b|=>|\/\/|\/\*/.test(code)) {
        return 'javascript';
    }

    return 'plaintext';
}

// Get file extension by language name
export function getExtensionByLanguage(language: string): string {
    return languageTemplates[language.toLowerCase()]?.extension || 'txt';
}
