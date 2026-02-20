import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Download, Heart, Star } from 'lucide-react';
// PromoBox is rendered globally via App.tsx

export default function Templates() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect legacy /templates path to the new /marketplace page
    setLocation('/marketplace', { replace: true });
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Template Marketplace</h1>
            <Link href="/">
              <Button variant="outline">Torna alla Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <Card className="p-4 sticky top-24">
                <h3 className="font-semibold mb-3">Filtri</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Categoria</h4>
                    <div className="space-y-2">
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Tutti</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Business</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Portfolio</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">E-commerce</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Blog</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">SaaS</button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Tecnologia</h4>
                    <div className="space-y-2">
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">HTML/CSS</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">React</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Vue</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Angular</button>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Prezzo</h4>
                    <div className="space-y-2">
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">Gratis</button>
                      <button className="block w-full text-left text-sm p-1 hover:bg-accent rounded">A pagamento</button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main content */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Cerca template..."
                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg bg-background text-sm"
                  />
                </div>
                <div>
                  <Button variant="outline" className="mr-2">Popolari</Button>
                  <Button>Recenti</Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Template cards */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="overflow-hidden group">
                    <div className="aspect-video bg-gray-200 relative">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button size="sm" variant="secondary" className="rounded-full p-2 h-auto">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="rounded-full p-2 h-auto">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground">
                        <Download className="h-4 w-4 mr-2" />
                        Usa Template
                      </Button>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">Template {item}</h3>
                        <span className="text-sm font-medium">€{item * 10}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Template moderno e responsive per {['business', 'portfolio', 'e-commerce'][item % 3]}.
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="text-sm">4.{item}</span>
                        </div>
                        <span className="text-xs bg-secondary px-2 py-1 rounded">+{item * 123} usi</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Button variant="outline">Carica altri template</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* PromoBox is rendered globally above footer */}
    </div>
  );
}