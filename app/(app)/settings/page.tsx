"use client";

import { useEffect, useRef, useState } from "react";
import { Settings, Upload } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import PageHeader from "@/components/page-header";
import Image from "next/image";

export default function SettingsPage() {
    const [supportEmail, setSupportEmail] = useState("");
    const [systemName, setSystemName] = useState("");
    const [logoUrl, setLogoUrl] = useState("");
    const [faviconUrl, setFaviconUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingFavicon, setUploadingFavicon] = useState(false);

    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    async function fetchSettings() {
        try {
            const response = await api.get<Record<string, string>>("/api/admin/settings");
            setSupportEmail(response.data["support_email"] ?? "");
            setSystemName(response.data["system_name"] ?? "");
            setLogoUrl(response.data["logo_url"] ?? "");
            setFaviconUrl(response.data["favicon_url"] ?? "");
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

    async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingLogo(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await api.post<{ url: string }>("/api/admin/settings/logo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setLogoUrl(response.data.url);
            toast.success("Logo atualizado com sucesso!");
        } catch {
            toast.error("Erro ao fazer upload do logo.");
        } finally {
            setUploadingLogo(false);
        }
    }

    async function handleUploadFavicon(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFavicon(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await api.post<{ url: string }>("/api/admin/settings/favicon", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setFaviconUrl(response.data.url);
            toast.success("Favicon atualizado com sucesso!");
        } catch {
            toast.error("Erro ao fazer upload do favicon.");
        } finally {
            setUploadingFavicon(false);
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

            <div className="max-w-2xl flex flex-col gap-4">
                {/* Configurações Gerais */}
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

                {/* Identidade Visual */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Identidade Visual</h2>

                    <div className="flex flex-col gap-6">
                        {/* Logo */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground text-center px-2">Sem logo</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUploadLogo}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                                    >
                                        <Upload size={14} />
                                        {uploadingLogo ? "Enviando..." : "Fazer upload"}
                                    </button>
                                    <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Recomendado: 200x60px</p>
                                </div>
                            </div>
                        </div>

                        {/* Favicon */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Favicon</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                                    {faviconUrl ? (
                                        <img src={faviconUrl} alt="Favicon" className="w-full h-full object-contain p-1" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground text-center px-1">Sem favicon</span>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <input
                                        ref={faviconInputRef}
                                        type="file"
                                        accept="image/png,image/x-icon,image/svg+xml"
                                        className="hidden"
                                        onChange={handleUploadFavicon}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => faviconInputRef.current?.click()}
                                        disabled={uploadingFavicon}
                                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted disabled:opacity-50"
                                    >
                                        <Upload size={14} />
                                        {uploadingFavicon ? "Enviando..." : "Fazer upload"}
                                    </button>
                                    <p className="text-xs text-muted-foreground">PNG, ICO ou SVG. Recomendado: 32x32px</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}