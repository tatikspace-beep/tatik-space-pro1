import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Mail,
    Lock,
    FolderOpen,
    Bell,
    ChevronRight,
    Eye,
    EyeOff,
    Shield,
    Edit2,
    Check,
    X,
    Heart,
    Star,
    Zap,
    Moon,
    Sun,
    Monitor,
    Loader2,
    Copy,
    QrCode,
    Code,
    Clock,
    Download,
    ShoppingCart,
} from 'lucide-react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import BannerMonetizationWidget from '@/components/BannerMonetizationWidget';
import BannerMonetizationDetails from '@/components/BannerMonetizationDetails';

// Import templates from centralized data layer
import { FREE_TEMPLATES, PREMIUM_TEMPLATES } from '@/data/templates';

export default function ProfilePage() {
    // determine reset token from query prior to auth hook
    const initialParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const initialToken = initialParams.get('reset');
    const { user, logout } = useAuth({ redirectOnUnauthenticated: !initialToken });
    const [resetToken, setResetToken] = useState<string | null>(null);
    const [newPasswordForm, setNewPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const { t } = useLanguage();
    const { t: i18nT } = useTranslation();

    // --- Saved Templates State (from TemplateMarketplace) ---
    const [savedTemplateIds, setSavedTemplateIds] = useState<string[]>([]);
    const [purchasedTemplateIds, setPurchasedTemplateIds] = useState<string[]>([]);
    const [purchasingTemplateId, setPurchasingTemplateId] = useState<string | null>(null);

    useEffect(() => {
        // Load from TemplateMarketplace localStorage key
        const saved = localStorage.getItem('tatik_saved_templates');
        if (saved) {
            try {
                setSavedTemplateIds(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load saved templates:', e);
            }
        }
    }, []);

    // Load purchased templates from server
    const purchasesQuery = trpc.templatePurchases.list.useQuery(undefined, {
        enabled: !!user,
    });

    useEffect(() => {
        if (purchasesQuery.data) {
            setPurchasedTemplateIds(purchasesQuery.data.map((p: any) => p.templateId));
        }
    }, [purchasesQuery.data]);

    // Checkout mutation
    const checkoutMutation = trpc.templatePurchases.createCheckoutSession.useMutation({
        onSuccess: (data) => {
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl;
            } else {
                toast.error('Impossibile avviare il pagamento');
            }
        },
        onError: (err) => {
            toast.error('Errore durante il pagamento: ' + (err.message || 'Unknown error'));
            setPurchasingTemplateId(null);
        },
    });

    // --- Contact Info State ---
    const [editingContact, setEditingContact] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: user?.name ?? '',
        email: user?.email ?? '',
    });

    // --- Password State ---
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [pwLoading, setPwLoading] = useState(false);

    // --- Theme Preference State ---
    const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
    const [themeLoading, setThemeLoading] = useState(false);

    // which tab is active
    const [activeTab, setActiveTab] = useState<'info' | 'password' | 'files' | 'alerts' | 'theme'>('info');

    // --- 2FA State ---
    const [twoFaEnabled, setTwoFaEnabled] = useState(false);
    const [showQrCode, setShowQrCode] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ secret: string; qrCode: string; backupCodes: string[] } | null>(null);
    const [twoFaCode, setTwoFaCode] = useState('');
    const [twoFaLoading, setTwoFaLoading] = useState(false);
    const [backupCodesVisible, setBackupCodesVisible] = useState(false);

    // Load initial theme preference
    const themeQuery = trpc.user.getThemePreference.useQuery(undefined, {
        onSuccess: (data) => {
            setSelectedTheme(data.theme as 'light' | 'dark' | 'system');
        },
    });

    // check URL for reset token
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tok = params.get('reset');
        if (tok) {
            setResetToken(tok);
            setActiveTab('password');
        }
    }, []);

    // Update theme mutation
    const updateThemeMutation = trpc.user.setThemePreference.useMutation({
        onSuccess: (data) => {
            setSelectedTheme(data.theme as 'light' | 'dark' | 'system');
            toast.success('Theme updated successfully');
            applyTheme(data.theme as 'light' | 'dark' | 'system');
        },
        onError: () => {
            toast.error('Failed to update theme');
        },
    });

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        const previous = selectedTheme;
        // Optimistic UI update so user sees immediate feedback
        setSelectedTheme(theme);
        applyTheme(theme);
        setThemeLoading(true);

        updateThemeMutation.mutate({ theme }, {
            onError: () => {
                // rollback on error
                setSelectedTheme(previous);
                applyTheme(previous);
                toast.error('Impossibile salvare la preferenza tema');
            },
            onSettled: () => setThemeLoading(false),
        });
    };

    const applyTheme = (theme: 'light' | 'dark' | 'system') => {
        const html = document.documentElement;
        console.log('[ProfilePage] applyTheme called with:', theme);

        if (theme === 'system') {
            // Determina il tema base dal sistema
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                html.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                console.log('[ProfilePage] System theme resolved to DARK');
            } else {
                html.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                console.log('[ProfilePage] System theme resolved to LIGHT');
            }
        } else if (theme === 'dark') {
            html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            console.log('[ProfilePage] Set theme to DARK, class:', html.classList.contains('dark'));
        } else if (theme === 'light') {
            html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            console.log('[ProfilePage] Set theme to LIGHT, class:', html.classList.contains('dark'));
        }
    };

    // Apply persisted theme once the preference is loaded from the server
    React.useEffect(() => {
        if (themeQuery?.data?.theme) {
            applyTheme(themeQuery.data.theme as 'light' | 'dark' | 'system');
        }
    }, [themeQuery?.data]);

    const handleContactSave = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: wire up to your trpc mutation e.g. trpc.user.updateProfile.mutate(contactForm)
        toast.success(t.profileUpdated ?? 'Profile updated!');
        setEditingContact(false);
    };

    const resetMutation = trpc.auth.resetPassword.useMutation({
        onSuccess: () => {
            toast.success('Password aggiornata, accedi con la nuova password');
            setResetToken(null);
            // optionally redirect or clear query
            window.history.replaceState({}, '', window.location.pathname);
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    const requestResetLink = trpc.auth.requestPasswordReset.useMutation({
        onSuccess: (data) => {
            if (data.link) {
                toast.success('Link generato (sviluppo): ' + data.link);
            } else {
                toast.success('Email inviata');
            }
        }
    });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (resetToken) {
            if (newPasswordForm.newPassword !== newPasswordForm.confirmPassword) {
                toast.error(t.passwordMismatch ?? 'Passwords do not match');
                return;
            }
            setPwLoading(true);
            try {
                resetMutation.mutate({ token: resetToken, newPassword: newPasswordForm.newPassword });
            } finally {
                setPwLoading(false);
            }
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error(t.passwordMismatch ?? 'Passwords do not match');
            return;
        }
        setPwLoading(true);
        try {
            // TODO: wire up to your trpc mutation e.g. trpc.auth.changePassword.mutate(...)
            await new Promise((r) => setTimeout(r, 800));
            toast.success(t.passwordChanged ?? 'Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            toast.error(t.error ?? 'Something went wrong');
        } finally {
            setPwLoading(false);
        }
    };

    if (!user) return null;

    const initials = user.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user.email.charAt(0).toUpperCase();

    return (
        <div className="profile-page-wrapper">

            {/* ── Header banner ── */}
            <div className="profile-header">
                <div className="profile-avatar-large">{initials}</div>
                <div className="profile-header-info">
                    <h1 className="profile-username">{user.name ?? user.email}</h1>
                    <p className="profile-email-sub">{user.email}</p>
                </div>
            </div>

            {/* Admin-only monetization statistic on profile page */}
            {(user.role === 'admin' || user.email === 'tatik.space@gmail.com') && (
                <div className="my-4 max-w-3xl mx-auto px-4">
                    <BannerMonetizationWidget />
                    <BannerMonetizationDetails />
                </div>
            )}

            {/* ── Tabs ── */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="profile-tabs">
                <TabsList className="profile-tabs-list">
                    <TabsTrigger value="info">
                        <User size={14} />&nbsp;{t.profileInfo ?? 'Profile'}
                    </TabsTrigger>
                    <TabsTrigger value="password">
                        <Lock size={14} />&nbsp;{t.changePassword ?? 'Password'}
                    </TabsTrigger>
                    <TabsTrigger value="files">
                        <FolderOpen size={14} />&nbsp;{t.myFiles ?? 'Files'}
                    </TabsTrigger>
                    <TabsTrigger value="alerts">
                        <Bell size={14} />&nbsp;{t.microJobAlerts ?? 'Alerts'}
                    </TabsTrigger>
                    <TabsTrigger value="theme">
                        <Sun size={14} />&nbsp;Theme
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Shield size={14} />&nbsp;Security
                    </TabsTrigger>
                    <TabsTrigger value="history">
                        <Clock size={14} />&nbsp;Version History
                    </TabsTrigger>
                </TabsList>

                {/* ── Profile Info ── */}
                <TabsContent value="info">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <div className="profile-card-header-row">
                                <div>
                                    <CardTitle>{t.contactInformation ?? 'Contact Information'}</CardTitle>
                                    <CardDescription>{t.contactInfoDesc ?? 'Your name and email address'}</CardDescription>
                                </div>
                                {!editingContact && (
                                    <Button variant="ghost" size="sm" onClick={() => setEditingContact(true)}>
                                        <Edit2 size={14} />&nbsp;{t.edit ?? 'Edit'}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editingContact ? (
                                <form className="profile-form" onSubmit={handleContactSave}>
                                    <div className="profile-form-field">
                                        <Label htmlFor="pf-name">{t.name ?? 'Name'}</Label>
                                        <Input
                                            id="pf-name"
                                            value={contactForm.name}
                                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="profile-form-field">
                                        <Label htmlFor="pf-email">{t.email}</Label>
                                        <Input
                                            id="pf-email"
                                            type="email"
                                            value={contactForm.email}
                                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="profile-form-actions">
                                        <Button type="submit" size="sm">
                                            <Check size={14} />&nbsp;{t.save ?? 'Save'}
                                        </Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => setEditingContact(false)}>
                                            <X size={14} />&nbsp;{t.cancel ?? 'Cancel'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="profile-info-rows">
                                    <div className="profile-info-row">
                                        <User size={15} className="profile-info-icon" />
                                        <span className="profile-info-label">{t.name ?? 'Name'}</span>
                                        <span className="profile-info-value">{user.name ?? '—'}</span>
                                    </div>
                                    <div className="profile-info-row">
                                        <Mail size={15} className="profile-info-icon" />
                                        <span className="profile-info-label">{t.email}</span>
                                        <span className="profile-info-value">{user.email}</span>
                                    </div>
                                    <div className="profile-info-row">
                                        <Shield size={15} className="profile-info-icon" />
                                        <span className="profile-info-label">{t.role ?? 'Role'}</span>
                                        <span className="profile-role-badge">{user.role ?? 'User'}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Change Password ── */}
                <TabsContent value="password">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <CardTitle>{t.changePassword ?? 'Change Password'}</CardTitle>
                            <CardDescription>{t.changePasswordDesc ?? 'Choose a strong, unique password'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {resetToken && (
                                <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded">
                                    <p className="text-sm">
                                        Hai richiesto la reimpostazione della password. Inserisci e conferma la nuova password qui sotto.
                                    </p>
                                </div>
                            )}
                            {!resetToken && (
                                <div className="mb-4 text-right">
                                    <Button size="sm" variant="outline" onClick={() => requestResetLink.mutate({ email: user?.email || '' })}>
                                        Invia link reimpostazione via email
                                    </Button>
                                </div>
                            )}
                            <form className="profile-form" onSubmit={handlePasswordChange}>
                                {resetToken ? (
                                    // reset mode - only ask new password
                                    <>
                                        <div className="profile-form-field">
                                            <Label htmlFor="pw-new">{t.newPassword ?? 'New Password'}</Label>
                                            <div className="profile-pw-wrapper">
                                                <Input
                                                    id="pw-new"
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={newPasswordForm.newPassword}
                                                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, newPassword: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="profile-pw-toggle"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                >
                                                    {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="profile-form-field">
                                            <Label htmlFor="pw-confirm">{t.confirmPassword ?? 'Confirm New Password'}</Label>
                                            <div className="profile-pw-wrapper">
                                                <Input
                                                    id="pw-confirm"
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={newPasswordForm.confirmPassword}
                                                    onChange={(e) => setNewPasswordForm({ ...newPasswordForm, confirmPassword: e.target.value })}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="profile-pw-toggle"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                >
                                                    {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    [
                                        { field: 'current' as const, label: t.currentPassword ?? 'Current Password', key: 'currentPassword' as const },
                                        { field: 'new' as const, label: t.newPassword ?? 'New Password', key: 'newPassword' as const },
                                        { field: 'confirm' as const, label: t.confirmPassword ?? 'Confirm New Password', key: 'confirmPassword' as const },
                                    ]
                                ).map(({ field, label, key }) => (
                                    <div className="profile-form-field" key={field}>
                                        <Label htmlFor={`pw-${field}`}>{label}</Label>
                                        <div className="profile-pw-wrapper">
                                            <Input
                                                id={`pw-${field}`}
                                                type={showPasswords[field] ? 'text' : 'password'}
                                                value={passwordForm[key]}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="profile-pw-toggle"
                                                onClick={() => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })}
                                            >
                                                {showPasswords[field] ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}                                <Button type="submit" disabled={pwLoading} className="w-full mt-2">
                                    {pwLoading ? (t.loading ?? 'Loading…') : (t.changePassword ?? 'Change Password')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Files & Favorites ── */}
                <TabsContent value="files" className="space-y-4">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <CardTitle>{t.myFiles ?? 'My Files'}</CardTitle>
                            <CardDescription>{t.myFilesDesc ?? 'Access and manage your uploaded files'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link to="/files" className="profile-files-link">
                                <FolderOpen size={20} />
                                <span>{t.openFiles ?? 'Open File Manager'}</span>
                                <ChevronRight size={18} className="ml-auto" />
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Purchased Templates */}
                    {purchasedTemplateIds.length > 0 && (
                        <Card className="profile-card">
                            <CardHeader className="profile-card-header">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart size={18} className="text-amber-500" />
                                    Template Acquistati ({purchasedTemplateIds.length})
                                </CardTitle>
                                <CardDescription>Accesso disponibile per 30 giorni dall'acquisto</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {purchasesQuery.data?.map((purchase: any) => {
                                        const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];
                                        const template = ALL_TEMPLATES.find(t => t.id === purchase.templateId);
                                        if (!template) return null;

                                        const daysLeft = Math.ceil(
                                            (new Date(purchase.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                        );

                                        return (
                                            <div key={purchase.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-sm text-foreground truncate">{template.name}</h4>
                                                        <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full whitespace-nowrap">✓ Attivo</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                                                    <div className="flex gap-2 items-center flex-wrap">
                                                        <div className="flex gap-1">
                                                            {template.tech.slice(0, 2).map(tech => (
                                                                <span key={tech} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium">{tech}</span>
                                                            ))}
                                                        </div>
                                                        {daysLeft > 0 && (
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                <Clock size={12} />
                                                                <span>{daysLeft} giorni rimasti</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 flex gap-1.5">
                                                    <Link to="/editor">
                                                        <Button
                                                            size="sm"
                                                            className="text-xs h-8 gap-1"
                                                            onClick={() => {
                                                                // Store the template data for the editor to use
                                                                const content = template.code;
                                                                localStorage.setItem('template_to_open', JSON.stringify({
                                                                    name: template.name,
                                                                    code: content,
                                                                    fileName: `${template.name.replace(/\s+/g, '_')}.html`
                                                                }));
                                                            }}
                                                        >
                                                            <Zap size={14} />
                                                            Apri con Editor
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Favorite Templates */}
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <CardTitle className="flex items-center gap-2">
                                <Heart size={18} className="text-red-500 fill-red-500" />
                                {' '}Preferiti ({savedTemplateIds.length})
                            </CardTitle>
                            <CardDescription>Template che hai salvato dal marketplace</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {savedTemplateIds.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Heart size={32} className="mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Nessun template nei favoriti</p>
                                    <p className="text-xs mt-1">Clicca sul cuore nel marketplace per aggiungerli</p>
                                    <Link to="/templates" className="mt-4 inline-block">
                                        <Button size="sm" variant="outline" className="gap-2">
                                            <Star size={14} />
                                            Vai al Marketplace
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm text-muted-foreground">{savedTemplateIds.length} template salvati</span>
                                        <Link to="/templates" className="inline-block">
                                            <Button size="sm" variant="outline" className="gap-2">
                                                <Star size={14} />
                                                Scopri altri
                                            </Button>
                                        </Link>
                                    </div>
                                    <div className="grid gap-3">
                                        {savedTemplateIds.map(templateId => {
                                            const ALL_TEMPLATES = [...FREE_TEMPLATES, ...PREMIUM_TEMPLATES];
                                            const template = ALL_TEMPLATES.find(t => t.id === templateId);
                                            if (!template) return null;

                                            return (
                                                <div key={template.id} className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-sm text-foreground truncate">{template.name}</h4>
                                                            {template.isPremium && (
                                                                <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap">€{template.price}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.description}</p>
                                                        <div className="flex gap-2 items-center flex-wrap">
                                                            <div className="flex gap-1">
                                                                {template.tech.slice(0, 2).map(tech => (
                                                                    <span key={tech} className="text-[10px] bg-secondary px-2 py-0.5 rounded text-secondary-foreground font-medium">{tech}</span>
                                                                ))}
                                                            </div>
                                                            {template.rating && (
                                                                <div className="flex items-center gap-1 text-xs">
                                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                                    <span className="text-muted-foreground">{template.rating}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 flex gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-8 gap-1"
                                                            onClick={async () => {
                                                                const attributionComment = '<!-- This template is from tatik.space - https://tatik.space -->\n';
                                                                const codeWithAttribution = attributionComment + template.code;

                                                                await navigator.clipboard.writeText(codeWithAttribution);
                                                                localStorage.setItem('copied_template', JSON.stringify({ code: codeWithAttribution, name: template.name }));
                                                                toast.success(i18nT('copied'));
                                                            }}
                                                            title={i18nT('copyCode')}
                                                        >
                                                            <Copy size={14} />
                                                            {i18nT('copyCode')}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs h-8 gap-1"
                                                            onClick={() => {
                                                                const elem = document.createElement('a');
                                                                elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(template.code));
                                                                elem.setAttribute('download', `${template.id}.html`);
                                                                elem.style.display = 'none';
                                                                document.body.appendChild(elem);
                                                                elem.click();
                                                                document.body.removeChild(elem);
                                                                toast.success(i18nT('fileDownloaded'));
                                                            }}
                                                            title="Scarica il template"
                                                        >
                                                            <Download size={14} />
                                                            Download
                                                        </Button>
                                                        {template.isPremium && (
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="text-xs h-8 bg-amber-500 hover:bg-amber-600 gap-1 disabled:opacity-50"
                                                                disabled={purchasingTemplateId === template.id || purchasedTemplateIds.includes(template.id)}
                                                                onClick={() => {
                                                                    setPurchasingTemplateId(template.id);
                                                                    checkoutMutation.mutate({
                                                                        templateId: template.id,
                                                                        templateName: template.name,
                                                                        price: parseFloat(template.price || '0'),
                                                                    });
                                                                }}
                                                                title={purchasedTemplateIds.includes(template.id) ? "Accesso già acquistato" : "Acquista template premium"}
                                                            >
                                                                {purchasedTemplateIds.includes(template.id) ? (
                                                                    <>
                                                                        <Check size={14} />
                                                                        Acquistato
                                                                    </>
                                                                ) : purchasingTemplateId === template.id ? (
                                                                    <>
                                                                        <Loader2 size={14} className="animate-spin" />
                                                                        Pagamento...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShoppingCart size={14} />
                                                                        Acquista €{template.price}
                                                                    </>
                                                                )}
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="shrink-0 text-red-600 dark:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                                                            onClick={() => {
                                                                const updated = savedTemplateIds.filter(id => id !== template.id);
                                                                setSavedTemplateIds(updated);
                                                                localStorage.setItem('tatik_saved_templates', JSON.stringify(updated));
                                                                toast.success(`${template.name} rimosso dai preferiti`);
                                                            }}
                                                            title="Rimuovi dai favoriti"
                                                        >
                                                            <Heart size={16} className="fill-current" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Micro-Job Alerts ── */}
                <TabsContent value="alerts">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <CardTitle>{t.microJobAlerts ?? 'Micro-Job Alerts'}</CardTitle>
                            <CardDescription>
                                {t.microJobAlertsDesc ?? 'Get notified when new micro-jobs matching your skills are posted'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold">Remote: React Dev Needed</div>
                                        <div className="text-xs text-muted-foreground">$60/h · 8+ hours · Remote</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href="https://www.upwork.com/search/jobs/?q=react%20developer&ref=tatik_microjob" target="_blank" rel="noopener noreferrer sponsored" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded">Apply</a>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground">Powered by marketplace listings — click to view similar gigs on Upwork</div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Theme Preferences ── */}
                <TabsContent value="theme">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <div>
                                <CardTitle className="flex items-center gap-2">✨ Theme Preferences</CardTitle>
                                <CardDescription>Choose how Tatik.space should look</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {themeQuery.isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {[
                                        { id: 'light' as const, label: 'Light', icon: Sun, description: 'Always use light theme', comingSoon: true },
                                        { id: 'dark' as const, label: 'Dark', icon: Moon, description: 'Always use dark theme', comingSoon: true },
                                        { id: 'system' as const, label: 'System', icon: Monitor, description: 'Follow system preference', comingSoon: false },
                                    ].map(({ id, label, icon: Icon, description, comingSoon }) => (
                                        <button
                                            key={id}
                                            onClick={() => !comingSoon && handleThemeChange(id)}
                                            disabled={themeLoading || comingSoon}
                                            className={`p-4 rounded-lg border-2 transition-all flex items-center gap-3 relative ${comingSoon ? 'opacity-50 cursor-not-allowed' : ''} ${selectedTheme === id && !comingSoon
                                                ? 'border-primary bg-primary/5'
                                                : comingSoon ? 'border-border/50' : 'border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <div className="flex-1 text-left">
                                                <div className="font-semibold">{label}</div>
                                                <div className="text-xs text-muted-foreground">{description}</div>
                                            </div>
                                            {comingSoon && (
                                                <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-1 rounded">
                                                    Coming Soon
                                                </div>
                                            )}
                                            {selectedTheme === id && !comingSoon && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Security & 2FA ── */}
                <TabsContent value="security">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <div>
                                <CardTitle className="flex items-center gap-2">🔐 Two-Factor Authentication</CardTitle>
                                <CardDescription>Add an extra layer of security to your account</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!showQrCode ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-900 dark:text-blue-200">
                                            {twoFaEnabled
                                                ? '✓ Two-factor authentication is currently enabled on your account'
                                                : 'Two-factor authentication adds an extra security layer by requiring a code from your phone'}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setShowQrCode(true);
                                            setTwoFaLoading(true);
                                            // In a real app, call trpc.twoFactor.generateSecret
                                            setTimeout(() => {
                                                setQrCodeData({
                                                    secret: 'JBSWY3DPEBLW64TMMQ5DI43BJQSGS3TSOM5VQ6S7JLVVQ3USAAA',
                                                    qrCode: 'https://via.placeholder.com/200x200?text=2FA+QR+Code',
                                                    backupCodes: Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase()),
                                                });
                                                setTwoFaLoading(false);
                                            }, 500);
                                        }}
                                        disabled={twoFaLoading}
                                        variant={twoFaEnabled ? 'outline' : 'default'}
                                    >
                                        <QrCode size={16} />
                                        {twoFaEnabled ? 'Reset 2FA' : 'Enable 2FA'}
                                    </Button>
                                </div>
                            ) : qrCodeData ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2">📱 Step 1: Scan QR Code</p>
                                        <p className="text-xs text-amber-800 dark:text-amber-300">Use an authenticator app (Google Authenticator, Authy, Microsoft Authenticator) to scan this code:</p>
                                    </div>

                                    {/* QR Code Display */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="border-2 border-dashed border-border p-4 rounded-lg bg-background">
                                            <img src={qrCodeData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                        </div>
                                        <p className="text-xs text-muted-foreground text-center">Can't scan? Enter this code manually:</p>
                                        <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg font-mono text-sm">
                                            <span>{qrCodeData.secret}</span>
                                            <button
                                                className="p-1 hover:bg-background rounded"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(qrCodeData.secret);
                                                    toast.success('Secret copied to clipboard');
                                                }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Verification Code Input */}
                                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                                        <p className="text-sm font-semibold text-green-900 dark:text-green-200 mb-3">✓ Step 2: Verify Code</p>
                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <Label htmlFor="totp-code" className="text-xs">Enter 6-digit code from your authenticator:</Label>
                                                <Input
                                                    id="totp-code"
                                                    type="text"
                                                    placeholder="000000"
                                                    maxLength={6}
                                                    value={twoFaCode}
                                                    onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                    className="font-mono text-center text-lg tracking-widest mt-1"
                                                />
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    if (twoFaCode.length === 6) {
                                                        setTwoFaLoading(true);
                                                        // In a real app, call trpc.twoFactor.enable
                                                        setTimeout(() => {
                                                            setTwoFaEnabled(true);
                                                            setBackupCodesVisible(true);
                                                            setTwoFaLoading(false);
                                                            toast.success('2FA enabled successfully!');
                                                        }, 500);
                                                    } else {
                                                        toast.error('Please enter 6 digits');
                                                    }
                                                }}
                                                disabled={twoFaCode.length !== 6 || twoFaLoading}
                                                size="sm"
                                            >
                                                Verify
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Backup Codes */}
                                    {backupCodesVisible && (
                                        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                            <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">⚠️ Save Backup Codes</p>
                                            <p className="text-xs text-red-800 dark:text-red-300 mb-3">Store these codes somewhere safe. You can use them to access your account if you lose your authenticator:</p>
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                {qrCodeData.backupCodes.map((code, i) => (
                                                    <div key={i} className="font-mono text-xs bg-background p-2 rounded border border-red-200 dark:border-red-800">
                                                        {code}
                                                    </div>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => {
                                                    const text = qrCodeData.backupCodes.join('\n');
                                                    navigator.clipboard.writeText(text);
                                                    toast.success('Backup codes copied to clipboard');
                                                }}
                                            >
                                                <Copy size={14} />
                                                Copy All Codes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Version History ── */}
                <TabsContent value="history">
                    <Card className="profile-card">
                        <CardHeader className="profile-card-header">
                            <div>
                                <CardTitle className="flex items-center gap-2">📚 Version History</CardTitle>
                                <CardDescription>Track changes and restore previous versions of your projects</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                <div className="flex gap-3">
                                    <Code size={24} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                                            ✨ Under Development & Testing
                                        </p>
                                        <p className="text-sm text-indigo-800 dark:text-indigo-200 mb-3">
                                            We're currently building a comprehensive version history system that will allow you to:
                                        </p>
                                        <ul className="space-y-1 text-sm text-indigo-700 dark:text-indigo-300 ml-4">
                                            <li>✓ Automatic snapshots of every project save</li>
                                            <li>✓ Browse complete file history with timestamps</li>
                                            <li>✓ Restore any previous version instantly</li>
                                            <li>✓ Compare changes between versions (diff view)</li>
                                            <li>✓ Named snapshots for important milestones</li>
                                            <li>✓ Cloud backup with 30-day retention</li>
                                        </ul>
                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 font-medium">
                                            → Expected release: March 2026
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    💡 <strong>What you can do now:</strong> Use "Save as Backup" on your editor to manually create snapshots of your current work.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ── Sign Out ── */}
            <div className="profile-signout-section">
                <Button
                    variant="destructive"
                    onClick={() => logout().then(() => { window.location.href = '/login'; })}
                >
                    {t.logout ?? 'Sign Out'}
                </Button>
            </div>
        </div>
    );
}
