"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Building2, Users, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import { SkeletonCard } from "@/components/skeleton";
import PageHeader from "@/components/page-header";

interface Metrics {
    totalTenants: number;
    activeTenants: number;
    totalUsers: number;
    newTenantsThisMonth: number;
}

export default function DashboardPage() {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Metrics>("/api/admin/dashboard")
            .then((res) => setMetrics(res.data))
            .finally(() => setLoading(false));
    }, []);

    const cards = metrics ? [
        {
            label: "Total de Tenants",
            value: metrics.totalTenants.toLocaleString("pt-BR"),
            icon: <Building2 size={20} />,
        },
        {
            label: "Tenants Ativos",
            value: metrics.activeTenants.toLocaleString("pt-BR"),
            icon: <LayoutDashboard size={20} />,
        },
        {
            label: "Total de Usuários",
            value: metrics.totalUsers.toLocaleString("pt-BR"),
            icon: <Users size={20} />,
        },
        {
            label: "Novos este Mês",
            value: metrics.newTenantsThisMonth.toLocaleString("pt-BR"),
            icon: <TrendingUp size={20} />,
        },
    ] : [];

    return (
        <div>
            <PageTitle title="Dashboard" />

            <PageHeader
                title="Dashboard"
                icon={<LayoutDashboard size={22} />}
                breadcrumb={[{ label: "Dashboard" }]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    cards.map((card) => (
                        <div
                            key={card.label}
                            className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {card.label}
                                </span>
                                <span className="text-muted-foreground">{card.icon}</span>
                            </div>
                            <p className="text-3xl font-bold text-foreground">{card.value}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}