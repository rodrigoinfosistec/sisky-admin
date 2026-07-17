"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import api from "@/lib/api";

interface Tenant {
    id: number;
    name: string;
    subdomain: string;
    active: boolean;
    createdAt: string;
    userCount: number;
    companyCount: number;
}

interface PaginatedResponse {
    data: Tenant[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 15,
        total: 0,
        lastPage: 1,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    async function fetchTenants(page: number) {
        setLoading(true);
        try {
            const response = await api.get<PaginatedResponse>(
                `/api/admin/tenants?page=${page}&perPage=${pagination.perPage}&search=${search}`
            );
            setTenants(response.data.data);
            setPagination({
                page: response.data.page,
                perPage: response.data.perPage,
                total: response.data.total,
                lastPage: response.data.lastPage,
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleActive(id: number) {
        await api.patch(`/api/admin/tenants/${id}/toggle-active`);
        fetchTenants(pagination.page);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearch(searchInput);
    }

    useEffect(() => {
        fetchTenants(1);
    }, [search]);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
                <p className="text-muted-foreground text-sm mt-1">Gestão de todos os tenants</p>
            </div>

            <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                <div className="px-4 lg:px-6 py-4 border-b border-border">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar por nome ou subdomínio..."
                            className="flex-1 border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
                            Buscar
                        </button>
                    </form>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-muted border-b border-border">
                        <tr>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">#</th>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">Nome</th>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">Subdomínio</th>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">Usuários</th>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">Empresas</th>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                            <th className="text-left px-6 py-3 text-muted-foreground font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={7} className="px-6 py-4">
                                        <div className="h-4 bg-muted rounded animate-pulse" />
                                    </td>
                                </tr>
                            ))
                        ) : tenants.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                    Nenhum tenant encontrado.
                                </td>
                            </tr>
                        ) : (
                            tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-muted/50">
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.id}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{tenant.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.subdomain}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.userCount}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.companyCount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tenant.active
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-muted text-muted-foreground"
                                            }`}>
                                            {tenant.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleActive(tenant.id)}
                                            className={`text-xs px-3 py-1 rounded font-medium transition-colors ${tenant.active
                                                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                                }`}
                                        >
                                            {tenant.active ? "Desativar" : "Ativar"}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">{pagination.total} tenants</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchTenants(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 text-sm border border-border text-foreground rounded-lg disabled:opacity-40 hover:bg-muted"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm text-muted-foreground">
                            {pagination.page} / {pagination.lastPage}
                        </span>
                        <button
                            onClick={() => fetchTenants(pagination.page + 1)}
                            disabled={pagination.page === pagination.lastPage}
                            className="px-3 py-1 text-sm border border-border text-foreground rounded-lg disabled:opacity-40 hover:bg-muted"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}