"use client";

import { useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import PageHeader from "@/components/page-header";
import { SkeletonTable } from "@/components/skeleton";

interface Ticket {
    id: number;
    tenantId: number;
    tenantName: string;
    companyName: string;
    userName: string;
    title: string;
    status: string;
    priority: string;
    messageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface Tenant {
    id: number;
    name: string;
}

interface PaginatedResponse {
    data: Ticket[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
    open: { label: "Aberto", color: "bg-green-100 text-green-700" },
    in_progress: { label: "Em andamento", color: "bg-blue-100 text-blue-700" },
    resolved: { label: "Resolvido", color: "bg-muted text-muted-foreground" },
    closed: { label: "Fechado", color: "bg-muted text-muted-foreground" },
};

const priorityLabels: Record<string, { label: string; color: string }> = {
    low: { label: "Baixa", color: "bg-muted text-muted-foreground" },
    medium: { label: "Média", color: "bg-yellow-100 text-yellow-700" },
    high: { label: "Alta", color: "bg-orange-100 text-orange-700" },
    urgent: { label: "Urgente", color: "bg-red-100 text-red-700" },
};

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
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
    const [filterTenant, setFilterTenant] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterPriority, setFilterPriority] = useState("");

    async function fetchTenants() {
        try {
            const response = await api.get<{ data: Tenant[] }>("/api/admin/tenants?perPage=100");
            setTenants(response.data.data);
        } catch {
            // ignora
        }
    }

    async function fetchTickets(page: number) {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                perPage: pagination.perPage.toString(),
            });
            if (search) params.append("search", search);
            if (filterTenant) params.append("tenantId", filterTenant);
            if (filterStatus) params.append("status", filterStatus);
            if (filterPriority) params.append("priority", filterPriority);

            const response = await api.get<PaginatedResponse>(`/api/admin/tickets?${params}`);
            setTickets(response.data.data);
            setPagination({
                page: response.data.page,
                perPage: response.data.perPage,
                total: response.data.total,
                lastPage: response.data.lastPage,
            });
        } catch {
            toast.error("Erro ao carregar tickets.");
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setSearch(searchInput);
    }

    useEffect(() => {
        fetchTenants();
    }, []);

    useEffect(() => {
        fetchTickets(1);
    }, [search, filterTenant, filterStatus, filterPriority]);

    return (
        <div>
            <PageTitle title="Tickets" />

            <PageHeader
                title="Tickets de Suporte"
                icon={<LifeBuoy size={22} />}
                breadcrumb={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Tickets" },
                ]}
            />

            <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                <div className="px-4 lg:px-6 py-4 border-b border-border flex flex-col gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Buscar por título ou usuário..."
                            className="flex-1 border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
                            Buscar
                        </button>
                        {(search || filterTenant || filterStatus || filterPriority) && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(""); setSearch(""); setFilterTenant(""); setFilterStatus(""); setFilterPriority(""); }}
                                className="px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted"
                            >
                                Limpar
                            </button>
                        )}
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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Todos os status</option>
                            {Object.entries(statusLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>

                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="border border-input bg-background text-foreground rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="">Todas as prioridades</option>
                            {Object.entries(priorityLabels).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>

                        <span className="text-xs text-muted-foreground">{pagination.total} tickets</span>
                    </div>
                </div>

                <div className="hidden lg:block">
                    {loading ? (
                        <SkeletonTable rows={5} cols={7} />
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">#</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Tenant</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Empresa</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Título</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Status</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Prioridade</th>
                                    <th className="text-left px-6 py-3 text-muted-foreground font-medium">Atualizado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                            Nenhum ticket encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="hover:bg-muted/50 cursor-pointer"
                                            onClick={() => window.location.href = `/tickets/${ticket.id}`}
                                        >
                                            <td className="px-6 py-4 text-muted-foreground">#{ticket.id}</td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs">{ticket.tenantName}</td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs">{ticket.companyName}</td>
                                            <td className="px-6 py-4 font-medium text-foreground">{ticket.title}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabels[ticket.status]?.color ?? "bg-muted text-muted-foreground"
                                                    }`}>
                                                    {statusLabels[ticket.status]?.label ?? ticket.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityLabels[ticket.priority]?.color ?? "bg-muted text-muted-foreground"
                                                    }`}>
                                                    {priorityLabels[ticket.priority]?.label ?? ticket.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                                                {new Date(ticket.updatedAt).toLocaleString("pt-BR")}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-t border-border">
                    <span className="text-sm text-muted-foreground">{pagination.total} tickets</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchTickets(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 text-sm border border-border text-foreground rounded-lg disabled:opacity-40 hover:bg-muted"
                        >
                            Anterior
                        </button>
                        <span className="px-3 py-1 text-sm text-muted-foreground">
                            {pagination.page} / {pagination.lastPage}
                        </span>
                        <button
                            onClick={() => fetchTickets(pagination.page + 1)}
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