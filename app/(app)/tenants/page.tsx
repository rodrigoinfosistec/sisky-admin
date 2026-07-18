"use client";

import { useEffect, useState } from "react";
import { Eye, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import ConfirmDialog from "@/components/confirm-dialog";
import CreateTenantModal from "./components/CreateTenantModal";
import EditTenantModal from "./components/EditTenantModal";

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
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
    const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [togglingTenant, setTogglingTenant] = useState<Tenant | null>(null);
    const [toggleLoading, setToggleLoading] = useState(false);

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

    async function handleDelete() {
        if (!deletingTenant) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/api/admin/tenants/${deletingTenant.id}`);
            toast.success("Tenant excluído com sucesso!");
            setDeletingTenant(null);
            fetchTenants(pagination.page);
        } catch (err: any) {
            if (err.response?.data) {
                toast.error(err.response.data);
            } else {
                toast.error("Erro ao excluir tenant.");
            }
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleToggleActive() {
        if (!togglingTenant) return;
        setToggleLoading(true);
        try {
            await api.patch(`/api/admin/tenants/${togglingTenant.id}/toggle-active`);
            toast.success(`Tenant ${togglingTenant.active ? "desativado" : "ativado"} com sucesso!`);
            setTogglingTenant(null);
            fetchTenants(pagination.page);
        } catch {
            toast.error("Erro ao atualizar tenant.");
        } finally {
            setToggleLoading(false);
        }
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
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
                    <p className="text-muted-foreground text-sm mt-1">Gestão de todos os tenants</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus size={15} />
                    Novo Tenant
                </button>
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
                        {search && (
                            <button
                                type="button"
                                onClick={() => { setSearchInput(""); setSearch(""); }}
                                className="px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted"
                            >
                                Limpar
                            </button>
                        )}
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
                                <tr key={tenant.id} className={`hover:bg-muted/50 ${!tenant.active ? "opacity-60" : ""}`}>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.id}</td>
                                    <td className="px-6 py-4 font-medium text-foreground">{tenant.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.subdomain}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.userCount}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{tenant.companyCount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tenant.active
                                            ? "bg-green-100 text-green-700"
                                            : "bg-muted text-muted-foreground"
                                            }`}>
                                            {tenant.active ? "Ativo" : "Inativo"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <a
                                                href={`/tenants/${tenant.id}`}
                                                className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-xs font-medium"
                                            >
                                                <Eye size={13} />
                                                Detalhes
                                            </a>
                                            <button
                                                onClick={() => setEditingTenant(tenant)}
                                                className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs font-medium"
                                            >
                                                <Pencil size={13} />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setTogglingTenant(tenant)}
                                                className={`text-xs font-medium ${tenant.active
                                                    ? "text-orange-500 hover:text-orange-700"
                                                    : "text-green-500 hover:text-green-700"
                                                    }`}
                                            >
                                                {tenant.active ? "Desativar" : "Ativar"}
                                            </button>
                                            <button
                                                onClick={() => setDeletingTenant(tenant)}
                                                className="flex items-center gap-1 text-destructive hover:text-destructive/80 text-xs font-medium"
                                            >
                                                <Trash2 size={13} />
                                                Excluir
                                            </button>
                                        </div>
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

            {
                showCreateModal && (
                    <CreateTenantModal
                        onClose={() => setShowCreateModal(false)}
                        onSuccess={() => fetchTenants(1)}
                    />
                )
            }

            <EditTenantModal
                tenant={editingTenant}
                onClose={() => setEditingTenant(null)}
                onSuccess={() => fetchTenants(pagination.page)}
            />

            <ConfirmDialog
                open={!!deletingTenant}
                title="Excluir tenant"
                description={`Tem certeza que deseja excluir o tenant "${deletingTenant?.name}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                loading={deleteLoading}
                onConfirm={handleDelete}
                onCancel={() => setDeletingTenant(null)}
            />

            <ConfirmDialog
                open={!!togglingTenant}
                title={togglingTenant?.active ? "Desativar tenant" : "Ativar tenant"}
                description={`Tem certeza que deseja ${togglingTenant?.active ? "desativar" : "ativar"} o tenant "${togglingTenant?.name}"?`}
                confirmLabel={togglingTenant?.active ? "Desativar" : "Ativar"}
                loading={toggleLoading}
                onConfirm={handleToggleActive}
                onCancel={() => setTogglingTenant(null)}
            />
        </div >
    );
}