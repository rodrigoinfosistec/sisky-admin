"use client";

import React, { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import PageHeader from "@/components/page-header";
import { SkeletonTable } from "@/components/skeleton";

interface AuditLog {
    id: number;
    tenantId: number | null;
    companyId: number | null;
    userId: number | null;
    userName: string;
    action: string;
    entity: string;
    entityId: number | null;
    oldValues: string | null;
    newValues: string | null;
    ipAddress: string | null;
    createdAt: string;
}

interface Tenant {
    id: number;
    name: string;
    subdomain: string;
}

interface PaginatedResponse {
    data: AuditLog[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
}

const actionLabels: Record<string, { label: string; color: string }> = {
    created: { label: "Criado", color: "bg-green-100 text-green-700" },
    updated: { label: "Atualizado", color: "bg-blue-100 text-blue-700" },
    deleted: { label: "Excluído", color: "bg-red-100 text-red-700" },
    logged_in: { label: "Login", color: "bg-purple-100 text-purple-700" },
    logged_out: { label: "Logout", color: "bg-muted text-muted-foreground" },
    switched_company: { label: "Trocou empresa", color: "bg-orange-100 text-orange-700" },
    activated: { label: "Ativado", color: "bg-green-100 text-green-700" },
    deactivated: { label: "Inativado", color: "bg-red-100 text-red-700" },
    password_changed: { label: "Senha alterada", color: "bg-yellow-100 text-yellow-700" },
    password_reset: { label: "Senha resetada", color: "bg-yellow-100 text-yellow-700" },
    avatar_updated: { label: "Avatar atualizado", color: "bg-blue-100 text-blue-700" },
};

const entityLabels: Record<string, string> = {
    User: "Usuário",
    UserCompany: "Empresa do usuário",
    UserRole: "Role do usuário",
    Role: "Perfil de acesso",
    RolePermission: "Permissão do perfil",
};

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 20,
        total: 0,
        lastPage: 1,
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filterTenant, setFilterTenant] = useState("");
    const [filterAction, setFilterAction] = useState("");
    const [filterEntity, setFilterEntity] = useState("");
    const [filterFrom, setFilterFrom] = useState("");
    const [filterTo, setFilterTo] = useState("");
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    async function fetchTenants() {
        try {
            const response = await api.get<{ data: Tenant[] }>("/api/admin/tenants?perPage=100");
            setTenants(response.data.data);
        } catch {
            // ignora
        }
    }

    async function fetchLogs(page: number) {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                perPage: pagination.perPage.toString(),
            });
            if (search) params.append("search", search);
            if (filterTenant) params.append("tenantId", filterTenant);
            if (filterAction) params.append("action", filterAction);
            if (filterEntity) params.append("entity", filterEntity);
            if (filterFrom) params.append("from", filterFrom);
            if (filterTo) params.append("to", filterTo);

            const response = await api.get<PaginatedResponse>(`/api/admin/audit?${params}`);
            setLogs(response.data.data);
            setPagination({
                page: response.data.page,
                perPage: response.data.perPage,
                total: response.data.total,
                lastPage: response.data.lastPage,
            });
        } catch {
            toast.error("Erro ao carregar logs.");
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearch(searchInput);
    }

    function handleClearFilters() {
        setSearchInput("");
        setSearch("");
        setFilterTenant("");
        setFilterAction("");
        setFilterEntity("");
        setFilterFrom("");
        setFilterTo("");
    }

    function formatJson(value: string | null) {
        if (!value) return null;
        try {
            return JSON.stringify(JSON.parse(value), null, 2);
        } catch {
            return value;
        }
    }

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        fetchLogs(1);
    }, [search, filterTenant, filterAction, filterEntity, filterFrom, filterTo]);

    return (
        <div>
            <PageTitle title="Auditoria" />

            <PageHeader
                title="Logs de Auditoria"
                icon={<ClipboardList size={22} />}
                breadcrumb={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Logs de Auditoria" },
                ]}
            />

            <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                <div className="px-4 lg:px-6 py-4 border-b border-border flex flex-col gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar por usuário..."
                            className="flex-1 border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
                            Buscar
                        </button>
                        <button type="button" onClick={handleClearFilters} className="px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted">
                            Limpar
                        </button>
                    </form>

                    <div className="flex items-center gap-2 flex-wrap">
                        <select
                            value={filterTenant}
                            onChange={(e) => setFilterTenant(e.target.value)}
                            className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Todos os tenants</option>
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Todas as ações</option>
                            {Object.entries(actionLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>

                        <select
                            value={filterEntity}
                            onChange={(e) => setFilterEntity(e.target.value)}
                            className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Todas as entidades</option>
                            {Object.entries(entityLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">De:</span>
                            <input
                                type="date"
                                value={filterFrom}
                                onChange={(e) => setFilterFrom(e.target.value)}
                                className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Até:</span>
                            <input
                                type="date"
                                value={filterTo}
                                onChange={(e) => setFilterTo(e.target.value)}
                                className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <span className="text-xs text-muted-foreground">{pagination.total} registros</span>
                    </div>
                </div>

                <div className="hidden lg:block">
                    {loading ? (
                        <SkeletonTable rows={8} cols={5} />
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Data</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Tenant</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Usuário</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Ação</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Entidade</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhum log encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <React.Fragment key={log.id}>
                                            <tr
                                                className="hover:bg-muted/50 cursor-pointer"
                                                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                            >
                                                <td className="px-6 py-3 text-muted-foreground text-xs whitespace-nowrap">
                                                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                                                </td>
                                                <td className="px-6 py-3 text-muted-foreground text-xs">
                                                    {tenants.find(t => t.id === log.tenantId)?.name ?? `#${log.tenantId}`}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-foreground">{log.userName}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionLabels[log.action]?.color ?? "bg-muted text-muted-foreground"
                                                        }`}>
                                                        {actionLabels[log.action]?.label ?? log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-muted-foreground text-xs">
                                                    {entityLabels[log.entity] ?? log.entity}
                                                    {log.entityId && <span className="ml-1 text-muted-foreground/60">#{log.entityId}</span>}
                                                </td>
                                                <td className="px-6 py-3 text-xs text-primary">
                                                    {(log.oldValues || log.newValues)
                                                        ? (expandedLog === log.id ? "Fechar ▴" : "Ver detalhes ▾")
                                                        : <span className="text-muted-foreground">—</span>}
                                                </td>
                                            </tr>
                                            {expandedLog === log.id && (log.oldValues || log.newValues) && (
                                                <tr className="bg-muted/30">
                                                    <td colSpan={6} className="px-6 py-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {log.oldValues && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Antes:</p>
                                                                    <pre className="text-xs bg-background border border-border rounded-lg p-3 overflow-auto max-h-40">
                                                                        {formatJson(log.oldValues)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {log.newValues && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-muted-foreground mb-1">Depois:</p>
                                                                    <pre className="text-xs bg-background border border-border rounded-lg p-3 overflow-auto max-h-40">
                                                                        {formatJson(log.newValues)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">{pagination.total} logs</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchLogs(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 text-sm border border-border text-foreground rounded-lg disabled:opacity-40 hover:bg-muted"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm text-muted-foreground">
                            {pagination.page} / {pagination.lastPage}
                        </span>
                        <button
                            onClick={() => fetchLogs(pagination.page + 1)}
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