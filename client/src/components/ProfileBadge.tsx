import React, { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'wouter';
import {
    User,
    Lock,
    FolderOpen,
    Bell,
    LogOut,
    ChevronDown,
} from 'lucide-react';

export default function ProfileBadge() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }

        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!user) return null;

    // Monetization query (hooks must be called at top level)
    const monetizationQuery = trpc.user.monetizationProgress.useQuery(undefined, {
        retry: 1,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email.charAt(0).toUpperCase();

    const handleLogout = async () => {
        setOpen(false);
        await logout();
        window.location.href = '/login';
    };

    return (
        <div className="profile-badge-container" ref={dropdownRef}>
            {/* ── Trigger Button ── */}
            <button
                className="profile-badge-trigger"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
            >
                <span className="profile-badge-avatar">{initials}</span>
                <span className="profile-badge-name">{user.name ?? user.email}</span>
                <ChevronDown size={14} className={`profile-badge-chevron ${open ? 'open' : ''}`} />
            </button>

            {/* ── Dropdown ── */}
            {open && (
                <div className="profile-badge-dropdown" role="menu">
                    {/* User info header */}
                    <div className="profile-dropdown-header">
                        <span className="profile-dropdown-avatar">{initials}</span>
                        <div className="profile-dropdown-header-text">
                            <span className="profile-dropdown-name">{user.name ?? '—'}</span>
                            <span className="profile-dropdown-email">{user.email}</span>
                        </div>
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Menu Items */}
                    <Link
                        to="/profile"
                        className="profile-dropdown-item"
                        onClick={() => setOpen(false)}
                    >
                        <User size={15} />
                        {t.profileInfo ?? 'Profile'}
                    </Link>

                    <Link
                        to="/profile?tab=password"
                        className="profile-dropdown-item"
                        onClick={() => setOpen(false)}
                    >
                        <Lock size={15} />
                        {t.changePassword ?? 'Change Password'}
                    </Link>

                    <Link
                        to="/files"
                        className="profile-dropdown-item"
                        onClick={() => setOpen(false)}
                    >
                        <FolderOpen size={15} />
                        {t.myFiles ?? 'My Files'}
                    </Link>

                    {/* Compact banner monetization pill (percentage + days) */}
                    <div className="px-3 py-2">
                        {monetizationQuery.isLoading ? (
                            <div className="h-6 w-16 bg-secondary rounded-full animate-pulse mx-auto" />
                        ) : (
                            <div className="mx-auto inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                                <span className="text-xs font-bold text-red-600">{Math.round(Math.min(monetizationQuery.data?.percentage ?? 0, 100))}%</span>
                                <span className="text-xs text-muted-foreground">{monetizationQuery.data?.daysRemaining ?? 0}g</span>
                            </div>
                        )}
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Micro-Job Alerts */}
                    <Link
                        to="/profile?tab=alerts"
                        className="profile-dropdown-item profile-dropdown-item--highlight"
                        onClick={() => setOpen(false)}
                    >
                        <Bell size={15} />
                        {t.microJobAlerts ?? 'Micro-Job Alerts'}
                    </Link>

                    <div className="profile-dropdown-divider" />

                    {/* Sign Out */}
                    <button
                        className="profile-dropdown-item profile-dropdown-item--danger"
                        onClick={handleLogout}
                        role="menuitem"
                    >
                        <LogOut size={15} />
                        {t.logout ?? 'Sign Out'}
                    </button>
                </div>
            )}
        </div>
    );
}
