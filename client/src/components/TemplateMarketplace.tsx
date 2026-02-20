import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Copy, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/_core/hooks/useAuth';
import { Helmet } from 'react-helmet-async';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'html' | 'css' | 'javascript' | 'typescript' | 'python' | 'java' | 'json' | 'sql' | 'form' | 'layout';
  code: string;
  preview?: string;
  isPaid?: boolean;
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
    id: 'css-layout',
    name: 'CSS Layout',
    description: 'Struttura CSS per layout moderno',
    category: 'css',
    code: `/* CSS - Struttura Layout Base */

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
    isPaid: true,
  },
  {
    id: 'responsive-nav',
    name: 'Navigazione Responsive',
    description: 'Menu di navigazione responsive con hamburger menu',
    category: 'html',
    code: `<nav class="navbar">
  <div class="navbar-container">
    <h1 class="logo">Logo</h1>
    <ul class="nav-menu">
      <li><a href="#home">Home</a></li>
      <li><a href="#about">Chi Siamo</a></li>
      <li><a href="#services">Servizi</a></li>
      <li><a href="#contact">Contatti</a></li>
    </ul>
    <div class="hamburger">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </div>
</nav>

<style>
.navbar {
  background: #333;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo {
  color: white;
  font-size: 1.5rem;
  margin: 0;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-menu a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: #3b82f6;
}

.hamburger {
  display: none;
  flex-direction: column;
  cursor: pointer;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: white;
  margin: 5px 0;
  transition: 0.3s;
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }
  
  .nav-menu {
    position: absolute;
    left: -100%;
    top: 70px;
    flex-direction: column;
    background: #333;
    width: 100%;
    text-align: center;
    transition: 0.3s;
    padding: 2rem 0;
  }
  
  .nav-menu.active {
    left: 0;
  }
}
</style>`,
    isPaid: true,
  },
  {
    id: 'contact-form',
    name: 'Form Contatti',
    description: 'Form di contatto completo con validazione',
    category: 'form',
    code: `<form class="contact-form" id="contactForm">
  <div class="form-group">
    <label for="name">Nome</label>
    <input type="text" id="name" name="name" required>
  </div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
  </div>
  
  <div class="form-group">
    <label for="message">Messaggio</label>
    <textarea id="message" name="message" rows="5" required></textarea>
  </div>
  
  <button type="submit" class="btn-submit">Invia</button>
</form>

<style>
.contact-form {
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-submit:hover {
  opacity: 0.9;
}
</style>

<script>
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  alert('Grazie per il messaggio!');
  this.reset();
});
</script>`,
    isPaid: true,
  },
  {
    id: 'card-grid',
    name: 'Griglia Card',
    description: 'Layout responsive con card in griglia',
    category: 'layout',
    code: `<div class="card-grid">
  <div class="card">
    <div class="card-image" style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);"></div>
    <div class="card-content">
      <h3>Card 1</h3>
      <p>Descrizione della card</p>
      <button class="card-btn">Scopri di più</button>
    </div>
  </div>
  
  <div class="card">
    <div class="card-image" style="background: linear-gradient(135deg, #ec4899, #f43f5e);"></div>
    <div class="card-content">
      <h3>Card 2</h3>
      <p>Descrizione della card</p>
      <button class="card-btn">Scopri di più</button>
    </div>
  </div>
  
  <div class="card">
    <div class="card-image" style="background: linear-gradient(135deg, #10b981, #14b8a6);"></div>
    <div class="card-content">
      <h3>Card 3</h3>
      <p>Descrizione della card</p>
      <button class="card-btn">Scopri di più</button>
    </div>
  </div>
</div>

<style>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 16px rgba(0,0,0,0.15);
}

.card-image {
  width: 100%;
  height: 200px;
}

.card-content {
  padding: 1.5rem;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}

.card-content p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.95rem;
}

.card-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.3s;
}

.card-btn:hover {
  opacity: 0.9;
}
</style>`,
    isPaid: true,
  },
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Sezione hero con immagine di sfondo',
    category: 'layout',
    code: `<section class="hero">
  <div class="hero-content">
    <h1>Benvenuto a Tatik.space</h1>
    <p>L'IDE web avanzato per sviluppatori moderni</p>
    <button class="hero-btn">Inizia Ora</button>
  </div>
</section>

<style>
.hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  margin: 0 0 1rem 0;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-content p {
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  opacity: 0.95;
}

.hero-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.hero-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-content p {
    font-size: 1.1rem;
  }
}
</style>`,
    isPaid: true,
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
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Check if user is admin (only tatik.space@gmail.com can access paid templates freely)
  const isAdmin = user?.email === 'tatik.space@gmail.com' || user?.role === 'ADMIN';

  const categories = ['all', 'javascript', 'typescript', 'python', 'java', 'json', 'sql', 'html', 'css', 'form', 'layout'];
  const filteredTemplates = selectedCategory === 'all'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === selectedCategory);

  const handleInsert = (template: Template) => {
    // Check if template is paid and user is not admin
    if (template.isPaid && !isAdmin) {
      toast.error('Questo template è disponibile solo per gli utenti PRO. Effettua il pagamento per accedervi.');
      return;
    }

    if (onInsertWithLanguage) {
      onInsertWithLanguage(template.code, template.category);
    } else {
      onInsert(template.code);
    }
    toast.success(`Template "${template.name}" inserito!`);
    setIsOpen(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Codice copiato negli appunti!');
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
        Template
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Marketplace Template
            </DialogTitle>
            <DialogDescription>
              Scegli un template e inseriscilo nel tuo editor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* SEO + Sponsored snippet: visible microcopy and rel="sponsored" CTA */}
            <div className="px-4">
              <div className="rounded-md border border-slate-700 bg-gradient-to-r from-indigo-900/40 to-slate-900/20 p-3 flex items-center justify-between" role="note" aria-label="Offerta sponsorizzata template">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-indigo-200">[Sponsor] Template Pro Bundles — ideal for React & Tailwind</div>
                  <div className="text-[12px] text-slate-300 truncate">Bundle ottimizzati per SEO, performance e accessibilità.</div>
                </div>
                <div className="ml-4">
                  <a href="https://example.com/template-bundles" target="_blank" rel="noopener noreferrer sponsored" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded">Scopri</a>
                </div>
              </div>
            </div>

            {/* Helmet: page meta + JSON-LD when marketplace dialog is open (improves crawlers and share snippets) */}
            <Helmet>
              <title>Template Marketplace — Template React, HTML e Tailwind</title>
              <meta name="description" content="Scarica template professionali per React, Next.js, HTML e CSS. Template ottimizzati SEO, accessibilità e Core Web Vitals." />
              <script type="application/ld+json">{`{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Tatik.space Template Marketplace",
  "description": "Template professionali per sviluppatori: React, HTML, CSS, Tailwind.",
  "itemListElement": [
    ${TEMPLATES.slice(0, 5).map((t, i) => `{ "@type": "ListItem", "position": ${i + 1}, "name": "${t.name.replace(/"/g, '\\"')}", "url": "https://tatik.space/templates/${t.id}" }`).join(',\n    ')}
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
                  {cat === 'all' ? 'Tutti' : cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {filteredTemplates.map(template => {
                const isLocked = template.isPaid && !isAdmin;
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer hover:shadow-lg transition-shadow ${isLocked ? 'opacity-60' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            {template.name}
                            {isLocked && <Lock className="h-4 w-4 text-orange-500" />}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        variant={isLocked ? 'outline' : 'default'}
                        disabled={isLocked}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isLocked) {
                            toast.error('Questo template è a pagamento. Effettua il pagamento per accedervi.');
                          } else {
                            handleInsert(template);
                          }
                        }}
                      >
                        {isLocked ? (
                          <>
                            <Lock className="h-4 w-4" />
                            Premium
                          </>
                        ) : (
                          'Inserisci'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedTemplate && (
              <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">{selectedTemplate.name}</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyCode(selectedTemplate.code)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copia
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
