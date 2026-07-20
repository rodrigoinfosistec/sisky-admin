"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Package, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";

interface TenantDetailsCompany {
    id: number;
    name: string;
    active: boolean;
}

interface TenantDetailsModule {
    id: number;
    name: string;
    slug: string;
    active: boolean;
}

interface TenantDetails {
    id: number;
    name: string;
    subdomain: string;
    active: boolean;
    createdAt: string;
    userCount: number;
    companies: TenantDetailsCompany[];
    modules: TenantDetailsModule[];
}

export default function TenantDetailsPage() {
    const { id } = useParams();
    const [tenant, setTenant] = useState<TenantDetails | null>(null);
    const [loading, setLoading] = useState(true);

    async function fetchTenant() {
        try {
            const response = await api.get<TenantDetails>(`/api/admin/tenants/${id}`);
            setTenant(response.data);
        } catch {
            toast.error("Erro ao carregar tenant.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchTenant();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tenant) return null;

    return (
        <div>
            <PageTitle title={tenant.name} />

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{tenant.name}</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {tenant.subdomain}.sisky.com.br · {tenant.active ? "Ativo" : "Inativo"}
                    </p>
                </div>
                <a
                    href="/tenants"
                    className="flex items-center gap-2 px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                    <ArrowLeft size={15} />
                    Voltar
                </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Usuários</span>
                        <Users size={16} className="text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{tenant.userCount}</p>
                </div>

                <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Empresas</span>
                        <Building2 size={16} className="text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{tenant.companies.length}</p>
                </div>

                <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Módulos</span>
                        <Package size={16} className="text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{tenant.modules.filter(m => m.active).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Empresas</h2>
                    {tenant.companies.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tenant.companies.map((company) => (
                                <div
                                    key={company.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                                >
                                    <span className="text-sm text-foreground">{company.name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-muted text-muted-foreground"
                                        }`}>
                                        {company.active ? "Ativa" : "Inativa"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Módulos</h2>
                    {tenant.modules.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhum módulo configurado.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tenant.modules.map((module) => (
                                <div
                                    key={module.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                                >
                                    <div>
                                        <p className="text-sm text-foreground">{module.name}</p>
                                        <p className="text-xs text-muted-foreground">{module.slug}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${module.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-muted text-muted-foreground"
                                        }`}>
                                        {module.active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}