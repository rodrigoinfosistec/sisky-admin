"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import PageHeader from "@/components/page-header";

export default function SettingsPage() {
    const [supportEmail, setSupportEmail] = useState("");
    const [systemName, setSystemName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    async function fetchSettings() {
        try {
            const response = await api.get<Record<string, string>>("/api/admin/settings");
            setSupportEmail(response.data["support_email"] ?? "");
            setSystemName(response.data["system_name"] ?? "");
        } catch {
            toast.error("Erro ao carregar configurações.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put("/api/admin/settings", {
                support_email: supportEmail,
                system_name: systemName,
            });
            toast.success("Configurações salvas com sucesso!");
        } catch {
            toast.error("Erro ao salvar configurações.");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <div>
            <PageTitle title="Configurações" />

            <PageHeader
                title="Configurações"
                icon={<Settings size={22} />}
                breadcrumb={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Configurações" },
                ]}
            />

            <div className="max-w-2xl">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Configurações Gerais</h2>

                    {loading ? (
                        <div className="flex flex-col gap-4">
                            <div className="h-10 bg-muted rounded-lg animate-pulse" />
                            <div className="h-10 bg-muted rounded-lg animate-pulse" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Nome do Sistema
                                </label>
                                <input
                                    type="text"
                                    value={systemName}
                                    onChange={(e) => setSystemName(e.target.value)}
                                    className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    E-mail de Suporte
                                </label>
                                <input
                                    type="email"
                                    value={supportEmail}
                                    onChange={(e) => setSupportEmail(e.target.value)}
                                    placeholder="suporte@sisky.com.br"
                                    className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    E-mail que receberá as notificações de novos tickets e respostas.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {saving ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}