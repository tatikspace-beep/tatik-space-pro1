import React, { useMemo } from 'react';

export default function SearchResultsPanel({ query, localFiles, onOpenMatch }: any) {
    const results = useMemo(() => {
        if (!query) return [];
        const q = query; // exact match
        const res: any[] = [];
        const ql = q.toLowerCase();
        for (const f of localFiles || []) {
            if (!f.content) continue;
            const lines = f.content.split(/\r?\n/);
            let offset = 0;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const li = line.toLowerCase().indexOf(ql);
                if (li !== -1) {
                    const from = offset + li;
                    const to = from + q.length;
                    res.push({ file: f, line: i + 1, preview: line.trim(), from, to });
                }
                offset += line.length + 1; // include newline
            }

            // detect if query matches a folder segment in the path
            const path = (f.path || f.name || '');
            const segments = path.split('/').filter(Boolean);
            const folderMatch = segments.slice(0, -1).find(s => s.toLowerCase() === ql);
            if (folderMatch) {
                res.push({ file: f, line: 0, preview: `Cartella: ${folderMatch}`, folderMatch });
            }
        }
        return res;
    }, [query, localFiles]);

    if (results.length === 0) return <div className="text-slate-400 p-2">Nessuna corrispondenza</div>;

    // Group by file
    const grouped: Record<string, any[]> = {};
    for (const r of results) {
        const key = r.file.path || r.file.name || 'unknown';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
    }

    return (
        <div className="space-y-0">
            {Object.keys(grouped).map((key) => (
                <div key={key} className="mb-0">
                    <div className="font-medium text-white text-xs">{key}</div>
                    <div className="mt-0">
                        {grouped[key].map((m: any, idx: number) => (
                            m.folderMatch ? (
                                <div key={idx} className="w-full text-left px-0.5 py-0 text-xs text-indigo-300">Cartella trovata: {m.folderMatch}</div>
                            ) : (
                                <button key={idx} onClick={() => onOpenMatch(m.file, m.line, m.from, m.to)} className="w-full text-left px-0.5 py-0 hover:bg-slate-800 rounded">
                                    <div className="text-slate-300 text-xs">Riga {m.line}: <span className="text-slate-400">{m.preview}</span></div>
                                </button>
                            )
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
