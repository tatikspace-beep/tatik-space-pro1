import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Copy, Star, Lock, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/_core/hooks/useAuth';
import { FREE_TEMPLATES, PREMIUM_TEMPLATES, Template } from '@/data/templates';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';

// Combine all templates
const ALL_TEMPLATES: Template[] = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];

export default function TemplateMarketplace() {
    const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: false });
    const { language } = useLanguage();
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
    const [selectedTech, setSelectedTech] = useState<string>('Tutti');
    const [priceFilter, setPriceFilter] = useState<string>('Tutti');
    const [sortBy, setSortBy] = useState<string>('Popolari');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [savedTemplateIds, setSavedTemplateIds] = useState<string[]>([]);
    const [userProjectId, setUserProjectId] = useState<number | null>(null);
    const [templateAccess, setTemplateAccess] = useState<{ hasAccess: boolean; expiresAt: Date | null } | null>(null);
    const [checkingAccess, setCheckingAccess] = useState(false);
    const [couponCode, setCouponCode] = useState<string>('');

    // Check if user is admin
    const isAdmin = user?.role === 'admin' || user?.email === 'tatik.space@gmail.com';

    // Load user's first project (only if user is loaded and authenticated)
    const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = trpc.projects.list.useQuery(undefined, {
        enabled: !!user && !authLoading,
    });

    useEffect(() => {
        if (projects.length > 0 && !userProjectId) {
            console.log('[TemplateMarketplace] Auto-selecting project:', projects[0].id);
            setUserProjectId(projects[0].id);
        }
    }, [projects, userProjectId]);

    // Load saved templates from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('tatik_saved_templates');
        if (saved) {
            try {
                setSavedTemplateIds(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved templates', e);
            }
        }
    }, []);

    // Save to localStorage whenever savedTemplateIds changes
    useEffect(() => {
        localStorage.setItem('tatik_saved_templates', JSON.stringify(savedTemplateIds));
    }, [savedTemplateIds]);

    const categories = ['Tutti', 'Business', 'Portfolio', 'E-commerce', 'Blog', 'SaaS'];
    const techs = ['Tutti', 'HTML/CSS', 'React', 'Vue', 'Angular'];
    const prices = ['Tutti', 'Gratis', 'A pagamento'];

    const filtered = useMemo(() => {
        return ALL_TEMPLATES.filter(t => {
            const matchSearch = !searchQuery ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.tech.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchCat = selectedCategory === 'Tutti' ||
                (selectedCategory === 'Business' && (t.category === 'business' || t.category === 'saas')) ||
                (selectedCategory === 'Portfolio' && t.category === 'portfolio') ||
                (selectedCategory === 'E-commerce' && t.category === 'ecommerce') ||
                (selectedCategory === 'Blog' && t.category === 'blog') ||
                (selectedCategory === 'SaaS' && t.category === 'saas');

            const matchTech = selectedTech === 'Tutti' ||
                (selectedTech === 'HTML/CSS' && t.tech.some(tech => tech.includes('HTML') || tech.includes('CSS'))) ||
                (selectedTech === 'React' && t.tech.some(tech => tech.includes('React')));

            const matchPrice = priceFilter === 'Tutti' ||
                (priceFilter === 'Gratis' && !t.isPremium) ||
                (priceFilter === 'A pagamento' && t.isPremium);

            return matchSearch && matchCat && matchTech && matchPrice;
        }).sort((a, b) => {
            if (sortBy === 'Popolari') return (b.uses || 0) - (a.uses || 0);
            if (sortBy === 'Recenti') return b.id.localeCompare(a.id);
            return 0;
        });
    }, [searchQuery, selectedCategory, selectedTech, priceFilter, sortBy]);

    const checkAccessMutation = trpc.templatePurchases.checkAccess.useMutation();
    const createCheckoutMutation = trpc.templatePurchases.createCheckoutSession.useMutation();

    // Handle copy template to clipboard
    const handleCopy = async (template: Template) => {
        const attributionComment = '<!-- This template is from tatik.space - https://tatik.space -->\n';
        const codeWithAttribution = attributionComment + template.code;

        await navigator.clipboard.writeText(codeWithAttribution);
        localStorage.setItem('copied_template', JSON.stringify({ code: codeWithAttribution, name: template.name }));
        setCopiedId(template.id);
        toast.success(t('copied'));
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Handle saving template to favorites
    const handleSaveTemplate = (template: Template) => {
        setSavedTemplateIds(prev =>
            prev.includes(template.id)
                ? prev.filter(id => id !== template.id)
                : [...prev, template.id]
        );
    };

    // Handle opening template details dialog
    const handleViewTemplate = async (template: Template) => {
        setSelectedTemplate(template);
        setTemplateAccess(null);
        
        // If template is premium and user is not admin, check if they have access
        if (template.isPremium && user && !isAdmin) {
            setCheckingAccess(true);
            try {
                const result = await checkAccessMutation.mutateAsync({ templateId: template.id });
                setTemplateAccess(result);
            } catch (error) {
                console.error('Error checking access:', error);
                setTemplateAccess({ hasAccess: false, expiresAt: null });
            } finally {
                setCheckingAccess(false);
            }
        } else {
            // Admin or free template - has access
            setTemplateAccess({ hasAccess: true, expiresAt: null });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* ── HEADER ── */}
            <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-sm">Template Marketplace</span>
                        <Badge variant="secondary" className="text-xs">{ALL_TEMPLATES.length} template</Badge>
                    </div>
                    <div className="flex-1 max-w-sm ml-auto">
                        <input
                            type="text"
                            placeholder="Cerca template..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full h-8 px-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            {/* ── HERO BANNER ── */}
            <div className="bg-gradient-to-r from-primary/10 to-emerald-10 border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Template Marketplace</h1>
                        <p className="text-sm text-muted-foreground mt-1">Scopri template professionali, pronti per la produzione. Filtra, prova e copia il codice con un click.</p>
                    </div>
                    <div className="hidden sm:flex gap-3">
                        <Button size="sm" className="bg-primary text-primary-foreground">Crea nuovo template</Button>
                        <Button size="sm" variant="outline">Guida</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* ── SIDEBAR ── */}
                <aside className="w-56 shrink-0 space-y-6">
                    {/* Categoria */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">📂 Categoria</p>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedCategory === cat
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                                        }`}
                                >
                                    <span>{cat}</span>
                                    <Badge variant={selectedCategory === cat ? 'default' : 'secondary'} className="text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                                        {ALL_TEMPLATES.filter(t =>
                                            cat === 'Tutti' ||
                                            (cat === 'Business' && (t.category === 'business' || t.category === 'saas')) ||
                                            (cat === 'Portfolio' && t.category === 'portfolio') ||
                                            (cat === 'E-commerce' && t.category === 'ecommerce') ||
                                            (cat === 'Blog' && t.category === 'blog') ||
                                            (cat === 'SaaS' && t.category === 'saas')
                                        ).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tecnologia */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">⚡ Tecnologia</p>
                        <div className="space-y-2">
                            {techs.map(tech => (
                                <button
                                    key={tech}
                                    onClick={() => setSelectedTech(tech)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedTech === tech
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                                        }`}
                                >
                                    <span>{tech}</span>
                                    <Badge variant={selectedTech === tech ? 'default' : 'secondary'} className="text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                                        {ALL_TEMPLATES.filter(t =>
                                            tech === 'Tutti' ||
                                            (tech === 'HTML/CSS' && t.tech.some(t => t.includes('HTML') || t.includes('CSS'))) ||
                                            (tech === 'React' && t.tech.some(t => t.includes('React')))
                                        ).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prezzo */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">💰 Prezzo</p>
                        <div className="space-y-2">
                            {prices.map(price => (
                                <button
                                    key={price}
                                    onClick={() => setPriceFilter(price)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${priceFilter === price
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                                        }`}
                                >
                                    <span>{price}</span>
                                    <Badge variant={priceFilter === price ? 'default' : 'secondary'} className="text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                                        {ALL_TEMPLATES.filter(t =>
                                            price === 'Tutti' ||
                                            (price === 'Gratis' && !t.isPremium) ||
                                            (price === 'A pagamento' && t.isPremium)
                                        ).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-accent/50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Statistiche</p>
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Template gratuiti</span>
                                <span className="font-medium">{FREE_TEMPLATES.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Template premium</span>
                                <span className="font-medium">{PREMIUM_TEMPLATES.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Risultati filtrati</span>
                                <span className="font-medium text-primary">{filtered.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Template salvati</span>
                                <span className="font-medium text-primary">{savedTemplateIds.length}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="flex-1 min-w-0">
                    {/* Sort bar */}
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{filtered.length}</span> template trovati
                        </p>
                        <div className="flex gap-2">
                            {['Popolari', 'Recenti'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSortBy(s)}
                                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${sortBy === s
                                        ? 'border-primary text-primary bg-primary/10'
                                        : 'border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Zap className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Nessun template trovato</p>
                            <p className="text-sm mt-1">Prova a cambiare i filtri</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.map(template => (
                                <div
                                    key={template.id}
                                    className="group flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Preview - Full height visual - scrollable */}
                                    <div className="relative h-60 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden flex-shrink-0 border-b border-border/30">
                                        <iframe
                                            srcDoc={template.code}
                                            className="w-full h-full border-0 pointer-events-none"
                                            title={`Preview: ${template.name}`}
                                            sandbox={{
                                                allow: ['same-origin', 'scripts'],
                                            } as any}
                                        />

                                        {/* Top-left rating badge */}
                                        {template.rating && (
                                            <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur">
                                                <Star className="h-3 w-3 text-amber-400" />
                                                <span className="font-medium">{template.rating}</span>
                                                <span className="opacity-70 text-[11px]">· {template.uses}</span>
                                            </div>
                                        )}

                                        {/* Hover actions overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-black/60 px-3 py-2 rounded-md flex gap-2">
                                                <button
                                                    onClick={() => handleViewTemplate(template)}
                                                    className="text-sm px-3 py-1 rounded-md bg-white/90 text-black font-semibold"
                                                >
                                                    Visualizza
                                                </button>
                                                <button
                                                    onClick={() => handleCopy(template)}
                                                    className="text-sm px-3 py-1 rounded-md bg-transparent border border-white/30 text-white"
                                                >
                                                    Copia
                                                </button>
                                                <button
                                                    onClick={() => handleSaveTemplate(template)}
                                                    className={`text-sm px-2 py-1 rounded-md ${savedTemplateIds.includes(template.id) ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
                                                >
                                                    {savedTemplateIds.includes(template.id) ? 'Salvato' : 'Salva'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Premium Overlay - only if NOT admin */}
                                        {template.isPremium && !isAdmin && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-4">
                                        {/* Header with price */}
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div>
                                                <h3 className="text-sm font-bold leading-snug text-foreground line-clamp-2">
                                                    {template.name}
                                                </h3>
                                            </div>
                                            {template.isPremium && (
                                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shrink-0">
                                                    €{template.price}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                            {template.description}
                                        </p>

                                        {/* Tech tags */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {template.tech.slice(0, 2).map(t => (
                                                <Badge key={t} variant="secondary" className="text-[10px] py-0.5">
                                                    {t}
                                                </Badge>
                                            ))}
                                            {template.rating && (
                                                <div className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <span className="font-medium">{template.rating}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-border/50 mb-3" />

                                        {/* Actions */}
                                        <div className="flex gap-2 mt-auto">
                                            {template.isPremium && !isAdmin ? (
                                                <Button
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs font-semibold bg-amber-500 hover:bg-amber-600"
                                                    onClick={() => handleViewTemplate(template)}
                                                >
                                                    <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                                    Acquista €{template.price}
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 h-8 text-xs font-semibold"
                                                        onClick={() => handleViewTemplate(template)}
                                                    >
                                                        <Zap className="h-3.5 w-3.5 mr-1" />
                                                        Visualizza
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 shrink-0"
                                                        onClick={() => handleCopy(template)}
                                                        title="Copia codice"
                                                    >
                                                        <Copy className={`h-3.5 w-3.5 ${copiedId === template.id ? 'text-green-500' : ''}`} />
                                                    </Button>
                                                </>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 shrink-0"
                                                onClick={() => handleSaveTemplate(template)}
                                                title={savedTemplateIds.includes(template.id) ? 'Rimosso dai preferiti' : 'Salva nei preferiti'}
                                            >
                                                <Heart className={`h-3.5 w-3.5 ${savedTemplateIds.includes(template.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                            </Button>
                                        </div>

                                        {/* Free badge */}
                                        {!template.isPremium && (
                                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 text-center">
                                                ✓ Completamente gratuito
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Load more */}
                    {filtered.length > 6 && (
                        <div className="text-center mt-8">
                            <Button variant="outline" size="sm">
                                Carica altri template
                            </Button>
                        </div>
                    )}
                </main>
            </div>

            {/* ── TEMPLATE DETAIL DIALOG ── */}
            <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
                <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0">
                    {selectedTemplate && (
                        <>
                            {/* Header */}
                            <div className="border-b border-border px-6 py-4 shrink-0">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <DialogTitle className="text-2xl font-bold text-foreground">
                                            {selectedTemplate.name}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm mt-2">
                                            {selectedTemplate.description}
                                        </DialogDescription>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end shrink-0 ml-4">
                                        {selectedTemplate.isPremium && (
                                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                                                Premium — €{selectedTemplate.price}
                                            </Badge>
                                        )}
                                        {!selectedTemplate.isPremium && (
                                            <Badge variant="secondary" className="font-semibold">
                                                ✓ Gratis
                                            </Badge>
                                        )}
                                        {selectedTemplate.rating && (
                                            <Badge variant="outline" className="gap-1">
                                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                {selectedTemplate.rating}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Meta info + Tech badges */}
                                <div className="flex gap-4 items-center mt-4 text-xs text-muted-foreground">
                                    <span>📊 {selectedTemplate.uses} usi</span>
                                    <span>📂 {selectedTemplate.category}</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {selectedTemplate.tech.map(t => (
                                            <Badge key={t} variant="secondary" className="text-[10px] py-0.5">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main content - Split layout */}
                            <div className="flex-1 overflow-hidden flex">
                                {/* Left: Live preview */}
                                <div className="flex-1 border-r border-border overflow-hidden flex flex-col">
                                    <div className="text-xs text-muted-foreground px-4 py-2 border-b border-border/50 bg-accent/30">
                                        📋 Anteprima live
                                    </div>
                                    <iframe
                                        srcDoc={selectedTemplate.code}
                                        className="flex-1 w-full border-0"
                                        title={`Preview: ${selectedTemplate.name}`}
                                        sandbox={{
                                            allow: ['same-origin', 'scripts'],
                                        } as any}
                                    />
                                </div>

                                {/* Right: Code + Actions */}
                                <div className="w-96 flex flex-col overflow-hidden">
                                    {/* Code section */}
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        <div className="text-xs text-muted-foreground px-4 py-2 border-b border-border/50 bg-accent/30">
                                            💻 Codice sorgente
                                        </div>
                                        {selectedTemplate.isPremium && !isAdmin && !templateAccess?.hasAccess ? (
                                            <div className="flex-1 p-4 flex items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900">
                                                <div className="text-center space-y-3">
                                                    <Lock className="h-8 w-8 text-amber-400 mx-auto" />
                                                    <p className="text-white font-semibold text-sm">Contenuto Premium</p>
                                                    <p className="text-slate-400 text-xs">Acquista per €{selectedTemplate.price}</p>
                                                    {templateAccess === null && checkingAccess && (
                                                        <p className="text-slate-500 text-xs">Verificando accesso...</p>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <ScrollArea className="flex-1">
                                                <pre className="p-4 text-[10px] text-slate-300 whitespace-pre-wrap break-words font-mono">
                                                    <code>{selectedTemplate.code}</code>
                                                </pre>
                                            </ScrollArea>
                                        )}
                                    </div>

                                    {/* Actions footer */}
                                    <div className="border-t border-border px-4 py-3 shrink-0 bg-card/50 space-y-2">
                                        {selectedTemplate.isPremium && !isAdmin && !templateAccess?.hasAccess ? (
                                            <>
                                                <Button
                                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold gap-2"
                                                    onClick={() => {
                                                        const session = createCheckoutMutation.mutate({
                                                            templateId: selectedTemplate.id,
                                                            templateName: selectedTemplate.name,
                                                            price: selectedTemplate.price
                                                        }, {
                                                            onSuccess: (data) => {
                                                                if (data?.checkoutUrl) {
                                                                    window.location.href = data.checkoutUrl;
                                                                } else {
                                                                    toast.error('Impossibile avviare il pagamento');
                                                                }
                                                            }
                                                        });
                                                    }}
                                                    disabled={createCheckoutMutation.isPending || checkingAccess}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    {createCheckoutMutation.isPending ? 'Caricamento...' : `Acquista per €${selectedTemplate.price}`}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold gap-1.5"
                                                    onClick={() => handleCopy(selectedTemplate)}
                                                    disabled={true}
                                                    title="Devi acquistare il template per copiare il codice"
                                                >
                                                    <Copy className="h-4 w-4 opacity-50" />
                                                    Copia (Richiede acquisto)
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="w-full bg-primary text-primary-foreground font-semibold gap-1.5"
                                                    onClick={() => handleCopy(selectedTemplate)}
                                                >
                                                    <Copy className={`h-4 w-4 ${copiedId === selectedTemplate.id ? 'text-green-400' : ''}`} />
                                                    {copiedId === selectedTemplate.id ? t('copied') : t('copyCode')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full font-semibold gap-1.5"
                                                    onClick={() => {
                                                        const elem = document.createElement('a');
                                                        elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(selectedTemplate.code));
                                                        elem.setAttribute('download', `${selectedTemplate.id}.html`);
                                                        elem.style.display = 'none';
                                                        document.body.appendChild(elem);
                                                        elem.click();
                                                        document.body.removeChild(elem);
                                                        toast.success(t('fileDownloaded'));
                                                    }}
                                                >
                                                    📥 Download
                                                </Button>
                                            </>
                                        )}
                                        <div className="flex gap-2 text-[10px] text-muted-foreground">
                                            <button
                                                onClick={() => handleSaveTemplate(selectedTemplate)}
                                                className={`px-2 py-1 rounded-md flex-1 border transition-colors ${savedTemplateIds.includes(selectedTemplate.id) ? 'bg-red-500/20 text-red-600 border-red-500/30' : 'border-border hover:bg-accent'}`}
                                            >
                                                {savedTemplateIds.includes(selectedTemplate.id) ? '❤️ Salvato' : '🤍 Salva'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
