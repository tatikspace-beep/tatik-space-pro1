import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { getEditorQuickTemplateCopy, getQuickTemplateContent, type EditorQuickTemplateId } from '@/lib/editorQuickTemplateCopy';
import { getEditorAppCopy } from '@/lib/editorAppCopy';
import { getEditorOutsideCopy, type EditorOutsideCopyKey } from '@/lib/editorOutsideCopy';
import { Helmet } from 'react-helmet-async';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'html' | 'css' | 'javascript' | 'typescript' | 'python' | 'java' | 'json' | 'sql' | 'form' | 'layout';
  code: string;
  preview?: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'js-base',
    name: 'JavaScript Base',
    description: 'Struttura base di una classe JavaScript',
    category: 'javascript',
    code: `// JavaScript - Struttura Base

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

const instance = new MyClass('World');
instance.greet();
console.log('Somma: ' + instance.calculate(5, 3));

module.exports = MyClass;
`,
  },
  {
    id: 'ts-base',
    name: 'TypeScript Base',
    description: 'Struttura base di TypeScript con interfaccia',
    category: 'typescript',
    code: `// TypeScript - Struttura Base con Interfaccia

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
  {
    id: 'python-base',
    name: 'Python Base',
    description: 'Struttura base di Python con classe',
    category: 'python',
    code: `# Python - Struttura Base con Classe

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
  {
    id: 'json-base',
    name: 'JSON Base',
    description: 'Struttura base di un file JSON',
    category: 'json',
    code: `{
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
  {
    id: 'sql-base',
    name: 'SQL Base',
    description: 'Struttura base di SQL con tabelle',
    category: 'sql',
    code: `-- SQL - Struttura Base

-- Creazione tabella utenti
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creazione tabella post
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Query di selezione
SELECT u.id, u.name, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name
ORDER BY post_count DESC;

-- Inserimento dati
INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com');
`,
  },
  {
    id: 'java-base',
    name: 'Java Base',
    description: 'Struttura base di una classe Java',
    category: 'java',
    code: `public class Main {
    private String name;
    
    public Main(String name) {
        this.name = name;
    }
    
    public void greet() {
        System.out.println("Hello, " + this.name + "!");
    }
    
    public int calculate(int a, int b) {
        return a + b;
    }
    
    public static void main(String[] args) {
        Main main = new Main("Java");
        main.greet();
        System.out.println("Somma: " + main.calculate(5, 3));
    }
}
`,
  },
  {
    id: 'html-responsive',
    name: 'HTML Responsive',
    description: 'Struttura HTML responsive base',
    category: 'html',
    code: `<!DOCTYPE html>
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
    </main>
    
    <footer>
        <p>&copy; 2024 Tatik Space Pro. Tutti i diritti riservati.</p>
    </footer>
</body>
</html>
`,
  },
  {
    id: 'dark-button',
    name: 'Bottone Gradiente',
    description: 'Bottone con effetto gradiente e hover',
    category: 'css',
    code: `<button class="btn-gradient">Clicca qui</button>

<style>
.btn-gradient {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  position: relative;
  overflow: hidden;
}

.btn-gradient::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  transition: left 0.3s ease;
  z-index: -1;
}

.btn-gradient:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.6);
}

.btn-gradient:active {
  transform: translateY(0);
}
</style>`,
  },
];

interface TemplateMarketplaceProps {
  onInsert: (code: string) => void;
  onInsertWithLanguage?: (code: string, language: string) => void;
}

export function TemplateMarketplace({ onInsert, onInsertWithLanguage }: TemplateMarketplaceProps) {
  const { language } = useLanguage();
  const quickTemplateCopy = (key: Parameters<typeof getEditorQuickTemplateCopy>[1], values: Record<string, string | number> = {}) =>
    getEditorQuickTemplateCopy(language, key, values);
  const copy = (key: EditorOutsideCopyKey, values: Record<string, string | number> = {}) =>
    getEditorOutsideCopy(language, key, values);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categories = ['all', 'javascript', 'typescript', 'python', 'java', 'json', 'sql', 'html', 'css', 'form', 'layout'];
  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleInsert = (template: Template) => {
    if (onInsertWithLanguage) {
      onInsertWithLanguage(template.code, template.category);
    } else {
      onInsert(template.code);
    }
    toast.success(quickTemplateCopy('inserted', { name: getQuickTemplateContent(language, template.id as EditorQuickTemplateId, 'name') }));
    setIsOpen(false);
  };

  const handleCopyCode = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.code);
      toast.success(quickTemplateCopy('copied'));
    } catch {
      toast.error(quickTemplateCopy('copyError'));
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="gap-1 px-2 py-1"
        variant="outline"
      >
        <Zap className="h-4 w-4" />
        {quickTemplateCopy('button')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {quickTemplateCopy('button')}
            </DialogTitle>
            <DialogDescription>
              {quickTemplateCopy('description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* SEO + Sponsored snippet: visible microcopy and rel="sponsored" CTA */}
            <div className="px-4">
              <div className="rounded-md border border-slate-700 bg-gradient-to-r from-indigo-900/40 to-slate-900/20 p-3 flex items-center justify-between" role="note" aria-label={quickTemplateCopy('sponsoredAria')}>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-indigo-200">{quickTemplateCopy('sponsoredTitle')}</div>
                  <div className="text-[12px] text-slate-300 truncate">{quickTemplateCopy('sponsoredDescription')}</div>
                </div>
                <div className="ml-4">
                  <a href="https://example.com/template-bundles" target="_blank" rel="noopener noreferrer sponsored" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">{getEditorAppCopy(language, 'discover')}</a>
                </div>
              </div>
            </div>

            {/* Helmet: page meta + JSON-LD when marketplace dialog is open (improves crawlers and share snippets) */}
            <Helmet>
              <title>{copy('marketplaceTitle')}</title>
              <meta name="description" content={copy('marketplaceDescription')} />
              <script type="application/ld+json">{`{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Tatik.space Template Marketplace",
  "description": "${copy('structuredDescription')}",
  "itemListElement": [
    ${TEMPLATES.slice(0, 5).map((t, i) => `{ "@type": "ListItem", "position": ${i + 1}, "name": "${getQuickTemplateContent(language, t.id as EditorQuickTemplateId, 'name').replace(/"/g, '\\"')}", "url": "https://tatik.space/templates/${t.id}" }`).join(',\n    ')}
  ]
}`}</script>
            </Helmet>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="capitalize"
                >
                  {cat === 'all' ? quickTemplateCopy('all') : cat === 'form' ? copy('categoryForm') : cat === 'layout' ? copy('categoryLayout') : cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {filteredTemplates.map(template => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base">{getQuickTemplateContent(language, template.id as EditorQuickTemplateId, 'name')}</CardTitle>
                          <CardDescription className="text-xs">
                            {getQuickTemplateContent(language, template.id as EditorQuickTemplateId, 'description')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInsert(template);
                        }}
                      >
                        {quickTemplateCopy('insert')}
                      </Button>
                    </CardContent>
                  </Card>
              ))}
            </div>

            {selectedTemplate && (
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">{getQuickTemplateContent(language, selectedTemplate.id as EditorQuickTemplateId, 'name')}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCode(selectedTemplate)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {quickTemplateCopy('copy')}
                  </Button>
                </div>
                <ScrollArea className="h-[200px] border rounded p-3 bg-white dark:bg-slate-950 font-mono text-sm">
                  <pre className="whitespace-pre-wrap break-words">
                    {selectedTemplate.code}
                  </pre>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
