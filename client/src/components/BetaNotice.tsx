import { Link } from "wouter";
import React from "react";

export function BetaNotice() {
    return (
        <section className="py-8 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800">
            <div className="container">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                            🚀 Fase di Test e Aggiornamento
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-200 mt-1 max-w-2xl">
                            Tatik.space Pro è in fase di sviluppo attivo. Alcune funzionalità sono in testing (Cronologia Versioni, Theme personalizzati ecc.). Supportiamo il feedback per migliorare continuamente.{' '}
                            <Link href="/support" className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100">
                                Segnala un problema
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
