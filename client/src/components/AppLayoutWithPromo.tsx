import React from 'react';

interface AppLayoutProps {
    children: React.ReactNode;
    showPromo?: boolean;
    trialDaysLeft?: number;
    className?: string;
}

/**
 * Layout wrapper that includes the collapsible PromoBox
 * Use this in pages to consistently display the promo section
 */
export function AppLayoutWithPromo({
    children,
    showPromo = true,
    trialDaysLeft = 90,
    className = ''
}: AppLayoutProps) {
    return (
        <div className={`flex flex-col min-h-screen ${className}`}>
            <div className="flex-1">
                {children}
            </div>

            {/* PromoBox rendering moved to global placement in App.tsx */}
        </div>
    );
}
