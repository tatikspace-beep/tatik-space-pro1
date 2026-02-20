import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { format } from 'date-fns';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';

// Map of activity types to page links
const ACTIVITY_PAGE_MAP: Record<string, string> = {
    'elemento': '/editor',
    'greenboxhybrid': '/projects',
    'adbanner': '/marketplace',
    'perfcheck': '/dashboard',
    'syntax pill courses': '/tutorials',
    'cloud-vault save': '/files',
    'get infinite history': '/dashboard',
    'encrypted/security': '/security',
    'deploy/linter (ai)': '/editor',
    'template bundles': '/marketplace',
    'optimize button': '/dashboard',
    'micro-job sample': '/jobs',
};

export default function BannerMonetizationDetails() {
    const { user } = useAuth();
    const { data, isLoading, error, refetch } = trpc.user.monetizationDetails.useQuery(undefined, {
        retry: 1,
        refetchOnWindowFocus: true,
    });

    const testMutation = trpc.user.devCreateTestBannerAddition.useMutation();

    const [filter, setFilter] = useState<string>('');
    const [sortBy, setSortBy] = useState<'date' | 'activity'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [selectedActivityType, setSelectedActivityType] = useState<string>('');

    const ITEMS_PER_PAGE = 10;

    if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Caricamento dettagli...</div>;
    if (error) return <div className="p-4 text-sm text-destructive">Errore caricamento dettagli</div>;

    const additions = data?.additions ?? [];

    // Filter
    let filtered = additions.filter((a: any) => {
        const text = (a.activityType || a.bannerId || '').toLowerCase();
        return text.includes(filter.toLowerCase());
    });

    // Sort
    filtered.sort((a: any, b: any) => {
        let cmp = 0;
        if (sortBy === 'date') {
            cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        } else if (sortBy === 'activity') {
            cmp = (a.activityType || a.bannerId || '').localeCompare(b.activityType || b.bannerId || '');
        }
        return sortOrder === 'asc' ? cmp : -cmp;
    });

    // Pagination
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedData = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Unique activities for quick filter buttons
    const uniqueActivities = Array.from(new Set(additions.map((a: any) => a.activityType || a.bannerId || 'Unknown'))).sort();

    const handleDevTestAdd = async (actType: string) => {
        try {
            await testMutation.mutateAsync({ activityType: actType });
            await refetch();
            setSelectedActivityType('');
        } catch (e) {
            console.error('Test add failed', e);
        }
    };

    const getPageLink = (activity: string): string => {
        const normalizedActivity = activity.toLowerCase().trim();
        return ACTIVITY_PAGE_MAP[normalizedActivity] || '#';
    };

    const isDevMode = import.meta.env.DEV;
    const isDevUser = user?.email === 'tatik.space@gmail.com';

    return (
        <div className="mt-4 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Dettaglio Interazioni Banner (ultimi 30 giorni)</h3>
                <button className="text-sm px-2 py-1 bg-primary/10 rounded hover:bg-primary/20" onClick={() => refetch()}>Aggiorna</button>
            </div>

            {/* Dev Test Controls */}
            {isDevMode && isDevUser && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded flex items-center gap-2">
                    <span className="text-xs text-amber-700 dark:text-amber-300">Dev Mode:</span>
                    <select
                        value={selectedActivityType}
                        onChange={(e) => setSelectedActivityType(e.target.value)}
                        className="text-xs rounded border px-2 py-0.5 bg-background"
                    >
                        <option value="">Seleziona activity...</option>
                        {uniqueActivities.map(act => (
                            <option key={act} value={act}>{act}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => handleDevTestAdd(selectedActivityType || 'Elemento')}
                        className="text-xs px-2 py-0.5 rounded bg-amber-600 text-white hover:bg-amber-700"
                        disabled={testMutation.isPending}
                    >
                        {testMutation.isPending ? 'Aggiungendo...' : 'Aggiungi Test'}
                    </button>
                </div>
            )}

            {/* Filter and Sort Controls */}
            <div className="mb-4 space-y-3">
                <div className="flex items-center gap-2">
                    <input
                        placeholder="Filtra per activity/banner"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="text-sm px-2 py-1 border rounded bg-transparent w-64"
                    />
                </div>

                {/* Quick filter buttons */}
                {uniqueActivities.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">Filtra veloce:</span>
                        {uniqueActivities.slice(0, 5).map(act => (
                            <button
                                key={act}
                                onClick={() => setFilter(act)}
                                className="text-xs px-2 py-0.5 rounded border border-border hover:bg-accent transition-colors"
                            >
                                {act.length > 20 ? act.substring(0, 20) + '...' : act}
                            </button>
                        ))}
                    </div>
                )}

                {/* Sort controls */}
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Ordina per:</span>
                    <button
                        onClick={() => setSortBy('date')}
                        className={`px-2 py-1 rounded text-xs ${sortBy === 'date' ? 'bg-primary/20' : 'hover:bg-accent'}`}
                    >
                        Data {sortBy === 'date' && (sortOrder === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />)}
                    </button>
                    <button
                        onClick={() => setSortBy('activity')}
                        className={`px-2 py-1 rounded text-xs ${sortBy === 'activity' ? 'bg-primary/20' : 'hover:bg-accent'}`}
                    >
                        Activity {sortBy === 'activity' && (sortOrder === 'asc' ? <ChevronUp className="inline w-3 h-3" /> : <ChevronDown className="inline w-3 h-3" />)}
                    </button>
                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="px-2 py-1 rounded text-xs hover:bg-accent"
                    >
                        {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                    </button>
                </div>
            </div>

            {/* Results summary */}
            <div className="text-xs text-muted-foreground mb-2">
                Mostrando {paginatedData.length > 0 ? ((page - 1) * ITEMS_PER_PAGE) + 1 : 0}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} di {filtered.length} risultati
            </div>

            {filtered.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nessuna interazione registrata.</div>
            ) : (
                <>
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-muted-foreground text-xs">
                                    <th className="pb-2 px-2">Data</th>
                                    <th className="pb-2 px-2">Banner / Activity</th>
                                    <th className="pb-2 px-2">Progetto</th>
                                    <th className="pb-2 px-2">Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((it: any, idx: number) => {
                                    const activity = it.activityType ?? it.bannerId ?? 'Unknown';
                                    const pageLink = getPageLink(activity);
                                    return (
                                        <tr key={idx} className="border-t hover:bg-accent/50 transition-colors">
                                            <td className="py-2 px-2 text-xs">{format(new Date(it.createdAt), 'yyyy-MM-dd HH:mm')}</td>
                                            <td className="py-2 px-2 text-xs font-medium">{activity}</td>
                                            <td className="py-2 px-2 text-xs">{it.projectId ?? '—'}</td>
                                            <td className="py-2 px-2">
                                                {pageLink !== '#' ? (
                                                    <a href={pageLink} className="text-primary hover:underline inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
                                                        Vai <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded border hover:bg-accent disabled:opacity-50"
                            >
                                Precedente
                            </button>
                            <span className="text-muted-foreground">
                                Pagina {page} di {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 rounded border hover:bg-accent disabled:opacity-50"
                            >
                                Successiva
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

