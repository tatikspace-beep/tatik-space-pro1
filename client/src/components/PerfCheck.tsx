import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Database } from 'lucide-react';

interface PerfMetrics {
    fps: number;
    renderTime: number;
    nodes: number;
    memory?: number;
}

export function PerfCheck() {
    const [metrics, setMetrics] = useState<PerfMetrics>({
        fps: 60,
        renderTime: 0,
        nodes: 0,
        memory: 0,
    });

    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(Date.now());
    const fpsRef = useRef(60);
    const animationIdRef = useRef<number | undefined>(undefined);
    const impressionTrackedRef = useRef(false);

    // CPM: Track impression once on mount (fire-and-forget)
    useEffect(() => {
        if (!impressionTrackedRef.current && typeof navigator !== 'undefined' && navigator.sendBeacon) {
            impressionTrackedRef.current = true;
            try {
                navigator.sendBeacon('/api/analytics/impression', JSON.stringify({
                    placement: 'perfcheck_badge',
                    partner: 'vercel',
                    timestamp: new Date().toISOString(),
                }));
            } catch (e) {
                // Silent fail: no impact on user experience
            }
        }
    }, []);

    useEffect(() => {
        const measurePerf = () => {
            // Measure FPS
            const now = Date.now();
            const elapsed = now - lastTimeRef.current;

            if (elapsed >= 1000) {
                fpsRef.current = Math.round((frameCountRef.current * 1000) / elapsed);
                frameCountRef.current = 0;
                lastTimeRef.current = now;
            }
            frameCountRef.current++;

            // Get DOM metrics
            const nodeCount = document.querySelectorAll('*').length;

            // Get memory if available
            let memory = 0;
            if ((performance as any).memory) {
                memory = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
            }

            // Measure paint timing
            let renderTime = 0;
            try {
                const entries = performance.getEntriesByType('paint');
                if (entries.length > 0) {
                    renderTime = Math.round(entries[0].startTime);
                }
            } catch (e) {
                // Fallback: estimate from navigation timing
                const perfNav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (perfNav) {
                    renderTime = Math.round(perfNav.domContentLoadedEventEnd - perfNav.domContentLoadedEventStart);
                }
            }

            setMetrics({
                fps: fpsRef.current,
                renderTime: Math.max(renderTime, 0),
                nodes: nodeCount,
                memory,
            });

            animationIdRef.current = requestAnimationFrame(measurePerf);
        };

        animationIdRef.current = requestAnimationFrame(measurePerf);

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
        };
    }, []);

    const getFpsColor = (fps: number) => {
        if (fps >= 55) return 'text-green-500';
        if (fps >= 30) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getRenderColor = (time: number) => {
        if (time <= 100) return 'text-green-500';
        if (time <= 500) return 'text-yellow-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-700 px-2 py-1 rounded border border-slate-600">
                {/* FPS */}
                <div className="flex items-center gap-1">
                    <Activity size={12} className={`${getFpsColor(metrics.fps)} flex-shrink-0`} />
                    <span className={`${getFpsColor(metrics.fps)} whitespace-nowrap`}>{metrics.fps} fps</span>
                </div>

                {/* Render Time */}
                <div className="flex items-center gap-1 border-l border-slate-500 pl-2">
                    <Zap size={12} className={`${getRenderColor(metrics.renderTime)} flex-shrink-0`} />
                    <span className={`${getRenderColor(metrics.renderTime)} whitespace-nowrap`}>{metrics.renderTime}ms</span>
                </div>

                {/* DOM Nodes */}
                <div className="flex items-center gap-1 border-l border-slate-500 pl-2">
                    <Database size={12} className="text-blue-400 flex-shrink-0" />
                    <span className="text-blue-400 whitespace-nowrap">{metrics.nodes} nodes</span>
                </div>

                {/* Memory (if available) */}
                {metrics.memory ? (
                    <div className="flex items-center gap-1 border-l border-slate-500 pl-2">
                        <span className="text-slate-300 whitespace-nowrap">{metrics.memory}MB</span>
                    </div>
                ) : null}
            </div>

            {/* CPM Badge: Powered by Vercel (compliant disclosure) */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                ⚡ Powered by{' '}
                <a
                    href="https://vercel.com?utm_source=tatik_preview&utm_medium=app&utm_campaign=perfcheck"
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    data-sponsored="true"
                    aria-label="Vercel - Sponsored"
                    className="text-slate-300 hover:text-slate-200 underline transition-colors"
                >
                    Vercel
                </a>
            </div>
        </div>
    );
}
