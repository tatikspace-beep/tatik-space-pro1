import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Copy, Star, Lock, ShoppingCart, Heart, Code2, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { FREE_TEMPLATES, TemplateMetadata } from '@/data/templates';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { DeveloperTemplateListings } from '@/components/DeveloperTemplateListings';
import { commercialSeoCopy } from '@/lib/commercialSeoCopy';
import { templateMarketplaceUiCopy } from '@/lib/templateMarketplaceUiCopy';
import { getLocalizedTemplateDescription } from '@/lib/templateMarketplaceContentCopy';

type MarketplaceTemplate = TemplateMetadata & { code?: string };

export default function TemplateMarketplace() {
    const { user, loading: authLoading } = useAuth({ redirectOnUnauthenticated: false });
    const { language } = useLanguage();
    const marketCopy = commercialSeoCopy[language] ?? commercialSeoCopy.en;
    const ui = templateMarketplaceUiCopy[language] ?? templateMarketplaceUiCopy.en;
    const communityListingsQuery = trpc.marketplace.listPublished.useQuery();
    const premiumCatalogQuery = trpc.templatePurchases.catalog.useQuery();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTech, setSelectedTech] = useState<string>('all');
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('popular');
    const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [savedTemplateIds, setSavedTemplateIds] = useState<string[]>([]);
    const [userProjectId, setUserProjectId] = useState<number | null>(null);
    const [templateAccess, setTemplateAccess] = useState<{ hasAccess: boolean; expiresAt: Date | null } | null>(null);
    const [checkingAccess, setCheckingAccess] = useState(false);
    const [detailView, setDetailView] = useState<'preview' | 'code'>('preview');
    const [previewZoom, setPreviewZoom] = useState(100);
    const [couponCode, setCouponCode] = useState<string>('');
    const allTemplates: MarketplaceTemplate[] = [
        ...FREE_TEMPLATES,
        ...(premiumCatalogQuery.data ?? []),
    ];

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

    const categories = [
        { id: 'all', label: ui.allCategories },
        { id: 'business', label: ui.business },
        { id: 'portfolio', label: ui.portfolio },
        { id: 'ecommerce', label: ui.ecommerce },
        { id: 'blog', label: ui.blog },
        { id: 'saas', label: ui.saas },
    ];
    const techs = [
        { id: 'all', label: ui.allTechnologies },
        { id: 'html', label: 'HTML/CSS' },
        { id: 'react', label: 'React' },
        { id: 'vue', label: 'Vue' },
        { id: 'angular', label: 'Angular' },
    ];
    const prices = [
        { id: 'all', label: ui.allPrices },
        { id: 'free', label: ui.free },
        { id: 'paid', label: ui.paid },
    ];
    const templateCategoryLabels: Record<string, string> = {
        business: ui.business,
        portfolio: ui.portfolio,
        ecommerce: ui.ecommerce,
        blog: ui.blog,
        saas: ui.saas,
    };

    const filtered = useMemo(() => {
        return allTemplates.filter(t => {
            const matchSearch = !searchQuery ||
                t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.tech.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchCat = selectedCategory === 'all' ||
                (selectedCategory === 'business' && (t.category === 'business' || t.category === 'saas')) ||
                (selectedCategory === 'portfolio' && t.category === 'portfolio') ||
                (selectedCategory === 'ecommerce' && t.category === 'ecommerce') ||
                (selectedCategory === 'blog' && t.category === 'blog') ||
                (selectedCategory === 'saas' && t.category === 'saas');

            const matchTech = selectedTech === 'all' ||
                (selectedTech === 'html' && t.tech.some(tech => tech.includes('HTML') || tech.includes('CSS'))) ||
                t.tech.some(tech => tech.toLowerCase().includes(selectedTech));

            const matchPrice = priceFilter === 'all' ||
                (priceFilter === 'free' && !t.isPremium) ||
                (priceFilter === 'paid' && t.isPremium);

            return matchSearch && matchCat && matchTech && matchPrice;
        }).sort((a, b) => {
            if (sortBy === 'popular') return (b.uses || 0) - (a.uses || 0);
            if (sortBy === 'recent') return b.id.localeCompare(a.id);
            return 0;
        });
    }, [allTemplates, searchQuery, selectedCategory, selectedTech, priceFilter, sortBy]);

    // Load purchases list to determine access locally
    const purchasesQuery = trpc.templatePurchases.list.useQuery(undefined, { enabled: !!user });
    const purchasedTemplateIds = purchasesQuery.data?.map((p: any) => p.templateId) ?? [];

    const utils = trpc.useUtils();
    const createCheckoutMutation = trpc.templatePurchases.createCheckoutSession.useMutation({
        onError: (error) => {
            console.error('Template checkout failed:', error);
            toast.error(ui.checkoutFailed);
        },
    });
    const getCodeMutation = trpc.templatePurchases.getCode.useMutation();
    const [authorizedCode, setAuthorizedCode] = useState<{ templateId: string; code: string } | null>(null);

    // Handle copy template to clipboard
    const handleCopy = async (template: MarketplaceTemplate) => {
        try {
            const code = template.isPremium
                ? (await getCodeMutation.mutateAsync({ templateId: template.id })).code
                : template.code;
            if (!code) {
                toast.error(ui.codeUnavailable);
                return;
            }
            if (template.isPremium) setAuthorizedCode({ templateId: template.id, code });
            const attributionComment = '<!-- This template is from tatik.space - https://tatik.space -->\n';
            const codeWithAttribution = attributionComment + code;

            await navigator.clipboard.writeText(codeWithAttribution);
            localStorage.setItem('copied_template', JSON.stringify({ code: codeWithAttribution, name: template.name }));
            setCopiedId(template.id);
            toast.success(ui.copySuccess);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : ui.codeUnavailable);
        }
    };

    // Handle saving template to favorites
    const handleSaveTemplate = (template: MarketplaceTemplate) => {
        setSavedTemplateIds(prev =>
            prev.includes(template.id)
                ? prev.filter(id => id !== template.id)
                : [...prev, template.id]
        );
    };

    // Handle opening template details dialog
    const handleViewTemplate = async (template: MarketplaceTemplate) => {
        setSelectedTemplate(template);
        setAuthorizedCode(null);
        setTemplateAccess(null);
        setDetailView('preview');
        setPreviewZoom(100);

        // If template is premium and user is not admin, check if they have access
        if (template.isPremium && user) {
            setCheckingAccess(true);
            try {
                const result = await utils.templatePurchases.checkAccess.fetch({ templateId: template.id });
                setTemplateAccess(result);
                if (result.hasAccess) {
                    const response = await getCodeMutation.mutateAsync({ templateId: template.id });
                    setAuthorizedCode({ templateId: template.id, code: response.code });
                }
            } catch (error) {
                console.error('Error checking access:', error);
                setTemplateAccess({ hasAccess: false, expiresAt: null });
                toast.error(error instanceof Error ? error.message : ui.codeUnavailable);
            } finally {
                setCheckingAccess(false);
            }
        } else if (template.isPremium) {
            setTemplateAccess({ hasAccess: false, expiresAt: null });
        } else {
            setTemplateAccess({ hasAccess: true, expiresAt: null });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* ── HEADER ── */}
            <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
                    <div className="flex min-w-0 items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-sm">{ui.marketplaceName}</span>
                        <Badge variant="secondary" className="text-xs">{allTemplates.length + (communityListingsQuery.data?.length || 0)} {ui.resultsFound}</Badge>
                    </div>
                    <div className="w-full min-w-0 sm:ml-auto sm:w-auto sm:max-w-sm sm:flex-1">
                        <input
                            type="text"
                            placeholder={ui.searchPlaceholder}
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
                        <h1 className="text-2xl font-extrabold text-foreground">{marketCopy.marketplaceHeading}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{marketCopy.marketplaceIntro}</p>
                    </div>
                    <div className="hidden sm:flex gap-3">
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" className="bg-primary text-primary-foreground" onClick={() => window.location.assign(user ? "/marketplace/developer" : "/login")}>{ui.sellTemplate}</Button>
                            {import.meta.env.DEV && <Button size="sm" variant="outline" onClick={() => window.location.assign("/marketplace/demo")}>{ui.demoPreview}</Button>}
                        </div>
                        <Button size="sm" variant="outline">{ui.guide}</Button>
                    </div>
                </div>
            </div>

            <DeveloperTemplateListings />

            <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col gap-6 md:flex-row">
                {/* ── SIDEBAR ── */}
                <aside className="w-full shrink-0 space-y-6 md:w-56">
                    {/* Categoria */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">📂 {ui.category}</p>
                        <div className="space-y-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedCategory === cat.id
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                                        }`}
                                >
                                    <span>{cat.label}</span>
                                    <Badge variant={selectedCategory === cat.id ? 'default' : 'secondary'} className="text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                                        {allTemplates.filter(t =>
                                            cat.id === 'all' ||
                                            (cat.id === 'business' && (t.category === 'business' || t.category === 'saas')) ||
                                            (cat.id === 'portfolio' && t.category === 'portfolio') ||
                                            (cat.id === 'ecommerce' && t.category === 'ecommerce') ||
                                            (cat.id === 'blog' && t.category === 'blog') ||
                                            (cat.id === 'saas' && t.category === 'saas')
                                        ).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tecnologia */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">⚡ {ui.technology}</p>
                        <div className="space-y-2">
                            {techs.map(tech => (
                                <button
                                    key={tech.id}
                                    onClick={() => setSelectedTech(tech.id)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${selectedTech === tech.id
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                                        }`}
                                >
                                    <span>{tech.label}</span>
                                    <Badge variant={selectedTech === tech.id ? 'default' : 'secondary'} className="text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                                        {allTemplates.filter(t =>
                                            tech.id === 'all' ||
                                            (tech.id === 'html' && t.tech.some(t => t.includes('HTML') || t.includes('CSS'))) ||
                                            t.tech.some(value => value.toLowerCase().includes(tech.id))
                                        ).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Prezzo */}
                    <div className="bg-card/50 rounded-lg p-4 border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">💰 {ui.price}</p>
                        <div className="space-y-2">
                            {prices.map(price => (
                                <button
                                    key={price.id}
                                    onClick={() => setPriceFilter(price.id)}
                                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${priceFilter === price.id
                                        ? 'bg-primary text-primary-foreground font-semibold shadow-md'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent'
                                        }`}
                                >
                                    <span>{price.label}</span>
                                    <Badge variant={priceFilter === price.id ? 'default' : 'secondary'} className="text-xs h-5 w-5 flex items-center justify-center rounded-full p-0">
                                        {allTemplates.filter(t =>
                                            price.id === 'all' ||
                                            (price.id === 'free' && !t.isPremium) ||
                                            (price.id === 'paid' && t.isPremium)
                                        ).length}
                                    </Badge>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-accent/50 rounded-lg p-3 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">{ui.statistics}</p>
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{ui.freeTemplates}</span>
                                <span className="font-medium">{FREE_TEMPLATES.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{ui.premiumTemplates}</span>
                                <span className="font-medium">{premiumCatalogQuery.data?.length ?? 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{ui.filteredResults}</span>
                                <span className="font-medium text-primary">{filtered.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{ui.savedTemplates}</span>
                                <span className="font-medium text-primary">{savedTemplateIds.length}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── MAIN ── */}
                <main className="flex-1 min-w-0">
                    {/* Sort bar */}
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{filtered.length}</span> {ui.resultsFound}
                        </p>
                        <div className="flex gap-2">
                            {[{ id: 'popular', label: ui.popular }, { id: 'recent', label: ui.recent }].map(s => (
                                <button
                                    key={s.id}
                                    onClick={() => setSortBy(s.id)}
                                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${sortBy === s.id
                                        ? 'border-primary text-primary bg-primary/10'
                                        : 'border-border text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            <Zap className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">{ui.noResults}</p>
                            <p className="text-sm mt-1">{ui.changeFilters}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.map(template => {
                                const hasAuthorizedCode = authorizedCode?.templateId === template.id;
                                const previewLocked = template.isPremium && !hasAuthorizedCode;
                                const previewCode = template.isPremium
                                    ? hasAuthorizedCode
                                        ? authorizedCode?.code ?? ''
                                        : `<div style="font:16px sans-serif;padding:24px;text-align:center">${ui.buyForPreview}</div>`
                                    : template.code ?? `<div style="font:16px sans-serif;padding:24px;text-align:center">${ui.previewUnavailable}</div>`;
                                return (
                                <div
                                    key={template.id}
                                    className="group flex flex-col rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Preview - Full height visual - scrollable */}
                                    <div className="relative h-60 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 overflow-hidden flex-shrink-0 border-b border-border/30">
                                        {template.isPremium ? (
                                            <img
                                                src={`/template-previews/${template.id}.jpg`}
                                                alt={`${ui.previewAlt} ${template.name}`}
                                                className="pointer-events-none h-full w-full object-contain"
                                            />
                                        ) : (
                                            <iframe
                                                srcDoc={previewCode}
                                                style={{ width: '400%', height: '400%', transform: 'scale(0.25)', transformOrigin: 'top left' }}
                                                className="border-0 pointer-events-none"
                                                title={`${ui.previewAlt}: ${template.name}`}
                                                sandbox="allow-scripts"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            aria-label={`${ui.openFullPreview} ${template.name}`}
                                            onClick={() => handleViewTemplate(template)}
                                            className="absolute inset-0 z-[1] w-full cursor-zoom-in"
                                        />

                                        {/* Top-left rating badge */}
                                        {template.rating && (
                                            <div className="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur">
                                                <Star className="h-3 w-3 text-amber-400" />
                                                <span className="font-medium">{template.rating}</span>
                                                <span className="opacity-70 text-[11px]">· {template.uses}</span>
                                            </div>
                                        )}

                                        {/* Hover actions overlay */}
                                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <div className="bg-black/60 px-3 py-2 rounded-md flex gap-2">
                                                <button
                                                    onClick={() => handleViewTemplate(template)}
                                                    className="pointer-events-auto text-sm px-3 py-1 rounded-md bg-white/90 text-black font-semibold"
                                                >
                                                    {ui.view}
                                                </button>
                                                {(!template.isPremium || !previewLocked) && (
                                                    <button
                                                        onClick={() => handleCopy(template)}
                                                        className="pointer-events-auto text-sm px-3 py-1 rounded-md bg-transparent border border-white/30 text-white"
                                                    >
                                                        {ui.copy}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleSaveTemplate(template)}
                                                    className={`pointer-events-auto text-sm px-2 py-1 rounded-md ${savedTemplateIds.includes(template.id) ? 'bg-red-500 text-white' : 'bg-white/10 text-white'}`}
                                                >
                                                    {savedTemplateIds.includes(template.id) ? ui.saved : ui.save}
                                                </button>
                                            </div>
                                        </div>

                                        {previewLocked && (
                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-8 text-xs font-medium text-white">
                                                {ui.fullPreviewProtected}
                                            </div>
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
                                            {getLocalizedTemplateDescription(template.id, template.description, language)}
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
                                                    {ui.purchaseFor} €{template.price}
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 h-8 text-xs font-semibold"
                                                        onClick={() => handleViewTemplate(template)}
                                                    >
                                                        <Zap className="h-3.5 w-3.5 mr-1" />
                                                        {ui.view}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0 shrink-0"
                                                        onClick={() => handleCopy(template)}
                                                        title={ui.copy}
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
                                                title={savedTemplateIds.includes(template.id) ? ui.saved : ui.save}
                                            >
                                                <Heart className={`h-3.5 w-3.5 ${savedTemplateIds.includes(template.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                            </Button>
                                        </div>

                                        {/* Free badge */}
                                        {!template.isPremium && (
                                            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 text-center">
                                                ✓ {ui.completelyFree}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                            })}
                        </div>
                    )}

                    {/* Load more */}
                    {filtered.length > 6 && (
                        <div className="text-center mt-8">
                            <Button variant="outline" size="sm">
                                {ui.loadMore}
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
                                            {getLocalizedTemplateDescription(selectedTemplate.id, selectedTemplate.description, language)}
                                        </DialogDescription>
                                    </div>
                                    <div className="mr-8 flex shrink-0 flex-col items-end gap-2 ml-4">
                                        {selectedTemplate.isPremium && (
                                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                                                Premium — €{selectedTemplate.price}
                                            </Badge>
                                        )}
                                        {!selectedTemplate.isPremium && (
                                            <Badge variant="secondary" className="font-semibold">
                                                ✓ {ui.freeBadge}
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
                                    <span>📊 {selectedTemplate.uses} {ui.uses}</span>
                                    <span>📂 {ui.categoryLabel}: {templateCategoryLabels[selectedTemplate.category.toLowerCase()] ?? selectedTemplate.category}</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {selectedTemplate.tech.map(t => (
                                            <Badge key={t} variant="secondary" className="text-[10px] py-0.5">
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2">
                                    <div className="inline-flex rounded-md border border-border p-1" role="tablist" aria-label={ui.viewTabs}>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={detailView === 'preview' ? 'default' : 'ghost'}
                                            role="tab"
                                            aria-selected={detailView === 'preview'}
                                            onClick={() => setDetailView('preview')}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />{ui.previewTab}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={detailView === 'code' ? 'default' : 'ghost'}
                                            role="tab"
                                            aria-selected={detailView === 'code'}
                                            onClick={() => setDetailView('code')}
                                        >
                                            <Code2 className="mr-2 h-4 w-4" />{ui.codeSource}
                                        </Button>
                                    </div>
                                    {detailView === 'preview' && (
                                        <div className="flex items-center gap-1" aria-label={ui.zoomControls}>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={ui.zoomOut}
                                                title={ui.zoomOut}
                                                disabled={previewZoom <= 50}
                                                onClick={() => setPreviewZoom((zoom) => Math.max(50, zoom - 10))}
                                            >
                                                <ZoomOut className="h-4 w-4" />
                                            </Button>
                                            <span className="min-w-12 text-center text-xs text-muted-foreground">{previewZoom}%</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={ui.zoomIn}
                                                title={ui.zoomIn}
                                                disabled={previewZoom >= 150}
                                                onClick={() => setPreviewZoom((zoom) => Math.min(150, zoom + 10))}
                                            >
                                                <ZoomIn className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                aria-label={ui.resetZoom}
                                                title={ui.resetZoom}
                                                disabled={previewZoom === 100}
                                                onClick={() => setPreviewZoom(100)}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="min-h-0 flex-1 overflow-hidden">
                                    {detailView === 'preview' ? (
                                        <div className="h-full w-full overflow-auto bg-white">
                                            {selectedTemplate.isPremium ? (
                                                <img
                                                    src={`/template-previews/${selectedTemplate.id}.jpg`}
                                                    alt={`${ui.previewAlt} ${selectedTemplate.name}`}
                                                    className="block h-auto max-w-none origin-top-left transition-[width] duration-150"
                                                    style={{ width: `${previewZoom}%` }}
                                                />
                                            ) : (
                                                <iframe
                                                    srcDoc={selectedTemplate.code}
                                                    title={`${ui.previewAlt}: ${selectedTemplate.name}`}
                                                    sandbox="allow-scripts"
                                                    className="block border-0"
                                                    style={{
                                                        width: `${10000 / previewZoom}%`,
                                                        height: `${10000 / previewZoom}%`,
                                                        transform: `scale(${previewZoom / 100})`,
                                                        transformOrigin: 'top left',
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ) : selectedTemplate.isPremium && !isAdmin && !templateAccess?.hasAccess ? (
                                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 p-6">
                                            <div className="max-w-sm space-y-3 text-center">
                                                <Lock className="mx-auto h-8 w-8 text-amber-400" />
                                                <p className="text-white font-semibold">{ui.premiumContent}</p>
                                                <p className="text-slate-300 text-sm">
                                                    {ui.sourceProtected}
                                                </p>
                                                <p className="text-amber-300 font-semibold">€{selectedTemplate.price}</p>
                                                {checkingAccess && <p className="text-slate-400 text-xs">{ui.checkingAccess}</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <ScrollArea className="h-full">
                                            <pre className="p-4 text-xs text-slate-300 whitespace-pre-wrap break-words font-mono">
                                                <code>{authorizedCode?.templateId === selectedTemplate.id ? (authorizedCode.code ?? '') : (selectedTemplate.code ?? '')}</code>
                                            </pre>
                                        </ScrollArea>
                                    )}
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border bg-card/50 px-4 py-3">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="mr-auto"
                                        onClick={() => handleSaveTemplate(selectedTemplate)}
                                    >
                                        <Heart className={`mr-2 h-4 w-4 ${savedTemplateIds.includes(selectedTemplate.id) ? 'fill-red-500 text-red-500' : ''}`} />
                                        {savedTemplateIds.includes(selectedTemplate.id) ? ui.saved : ui.save}
                                    </Button>
                                    {selectedTemplate.isPremium && !isAdmin && !templateAccess?.hasAccess ? (
                                        <Button
                                            className="bg-amber-500 font-semibold text-white hover:bg-amber-600"
                                            onClick={() => {
                                                createCheckoutMutation.mutate({
                                                    templateId: selectedTemplate.id,
                                                    templateName: selectedTemplate.name,
                                                    price: selectedTemplate.price,
                                                }, {
                                                    onSuccess: (data) => {
                                                        if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
                                                        else toast.error(ui.checkoutFailed);
                                                    },
                                                });
                                            }}
                                            disabled={createCheckoutMutation.isPending || checkingAccess}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            {createCheckoutMutation.isPending ? ui.loading : `${ui.purchaseFor} €${selectedTemplate.price}`}
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                onClick={() => handleCopy(selectedTemplate)}
                                                disabled={getCodeMutation.isPending}
                                            >
                                                <Copy className={`mr-2 h-4 w-4 ${copiedId === selectedTemplate.id ? 'text-green-400' : ''}`} />
                                                {copiedId === selectedTemplate.id ? ui.copySuccess : ui.copy}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                    void (async () => {
                                                        try {
                                                            const code = selectedTemplate.isPremium
                                                                ? (await getCodeMutation.mutateAsync({ templateId: selectedTemplate.id })).code
                                                                : selectedTemplate.code ?? '';
                                                            const element = document.createElement('a');
                                                            element.href = `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`;
                                                            element.download = `${selectedTemplate.id}.html`;
                                                            element.click();
                                                            toast.success(ui.downloadSuccess);
                                                        } catch (error) {
                                                            toast.error(error instanceof Error ? error.message : ui.copyFailed);
                                                        }
                                                    })();
                                                }}
                                                disabled={getCodeMutation.isPending}
                                            >
                                                📥 {ui.download}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
