"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, Package, Users, Plus, Pencil, Trash2, Cpu, Database, Eraser } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import PageHeader from "@/components/page-header";
import ConfirmDialog from "@/components/confirm-dialog";
import CreateCompanyModal from "./components/CreateCompanyModal";
import EditCompanyModal from "./components/EditCompanyModal";
import CreateDeviceModal from "./components/CreateDeviceModal";

interface TenantDetailsCompany {
    id: number;
    name: string;
    primaryColor: string | null;
    active: boolean;
}

interface TenantDetailsModule {
    id: number;
    name: string;
    slug: string;
    isCore: boolean;
    active: boolean;
}

interface IoTDevice {
    id: number;
    name: string;
    type: string;
    active: boolean;
    createdAt: string;
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
    const [togglingModule, setTogglingModule] = useState<number | null>(null);
    const [showCreateCompany, setShowCreateCompany] = useState(false);
    const [editingCompany, setEditingCompany] = useState<TenantDetailsCompany | null>(null);
    const [deletingCompany, setDeletingCompany] = useState<TenantDetailsCompany | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [togglingCompany, setTogglingCompany] = useState<number | null>(null);
    const [devices, setDevices] = useState<IoTDevice[]>([]);
    const [showCreateDevice, setShowCreateDevice] = useState(false);
    const [deletingDevice, setDeletingDevice] = useState<IoTDevice | null>(null);
    const [deleteDeviceLoading, setDeleteDeviceLoading] = useState(false);
    const [seedingDevice, setSeedingDevice] = useState<number | null>(null);
    const [clearingDevice, setClearingDevice] = useState<number | null>(null);
    const [togglingDevice, setTogglingDevice] = useState<number | null>(null);

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

    async function fetchDevices() {
        try {
            const response = await api.get<IoTDevice[]>(`/api/admin/tenants/${id}/devices`);
            setDevices(response.data);
        } catch {
            toast.error("Erro ao carregar dispositivos.");
        }
    }

    async function handleToggleModule(moduleId: number, isCore: boolean) {
        if (isCore) return;
        setTogglingModule(moduleId);
        try {
            await api.patch(`/api/admin/tenants/${id}/modules/${moduleId}/toggle`);
            toast.success("Módulo atualizado com sucesso!");
            fetchTenant();
        } catch (err: any) {
            toast.error(err.response?.data ?? "Erro ao atualizar módulo.");
        } finally {
            setTogglingModule(null);
        }
    }

    async function handleToggleCompany(companyId: number) {
        setTogglingCompany(companyId);
        try {
            await api.patch(`/api/admin/tenants/${id}/companies/${companyId}/toggle-active`);
            toast.success("Empresa atualizada com sucesso!");
            fetchTenant();
        } catch {
            toast.error("Erro ao atualizar empresa.");
        } finally {
            setTogglingCompany(null);
        }
    }

    async function handleDeleteCompany() {
        if (!deletingCompany) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/api/admin/tenants/${id}/companies/${deletingCompany.id}`);
            toast.success("Empresa excluída com sucesso!");
            setDeletingCompany(null);
            fetchTenant();
        } catch (err: any) {
            toast.error(err.response?.data ?? "Erro ao excluir empresa.");
        } finally {
            setDeleteLoading(false);
        }
    }

    async function handleToggleDevice(deviceId: number) {
        setTogglingDevice(deviceId);
        try {
            await api.patch(`/api/admin/tenants/${id}/devices/${deviceId}/toggle`);
            toast.success("Dispositivo atualizado com sucesso!");
            fetchDevices();
        } catch {
            toast.error("Erro ao atualizar dispositivo.");
        } finally {
            setTogglingDevice(null);
        }
    }

    async function handleDeleteDevice() {
        if (!deletingDevice) return;
        setDeleteDeviceLoading(true);
        try {
            await api.delete(`/api/admin/tenants/${id}/devices/${deletingDevice.id}`);
            toast.success("Dispositivo excluído com sucesso!");
            setDeletingDevice(null);
            fetchDevices();
        } catch (err: any) {
            toast.error(err.response?.data ?? "Erro ao excluir dispositivo.");
        } finally {
            setDeleteDeviceLoading(false);
        }
    }

    async function handleSeedDevice(deviceId: number) {
        setSeedingDevice(deviceId);
        try {
            await api.post(`/api/admin/tenants/${id}/devices/${deviceId}/seed`);
            toast.success("Dados mockados gerados com sucesso!");
        } catch {
            toast.error("Erro ao gerar dados mockados.");
        } finally {
            setSeedingDevice(null);
        }
    }

    async function handleClearDevice(deviceId: number) {
        setClearingDevice(deviceId);
        try {
            await api.delete(`/api/admin/tenants/${id}/devices/${deviceId}/readings`);
            toast.success("Leituras removidas com sucesso!");
        } catch {
            toast.error("Erro ao remover leituras.");
        } finally {
            setClearingDevice(null);
        }
    }

    useEffect(() => {
        fetchTenant();
        fetchDevices();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tenant) return null;

    const coreModules = tenant.modules.filter(m => m.isCore);
    const optionalModules = tenant.modules.filter(m => !m.isCore);

    return (
        <div>
            <PageTitle title={tenant.name} />

            <PageHeader
                title={tenant.name}
                icon={<Building2 size={22} />}
                breadcrumb={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Tenants", href: "/tenants" },
                    { label: tenant.name },
                ]}
                actions={
                    <a
                        href="/tenants"
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Voltar
                    </a>
                }
            />

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
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Módulos Ativos</span>
                        <Package size={16} className="text-muted-foreground" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{tenant.modules.filter(m => m.active).length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Empresas */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-foreground">Empresas</h2>
                        <button
                            onClick={() => setShowCreateCompany(true)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Plus size={13} />
                            Nova
                        </button>
                    </div>
                    {tenant.companies.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada.</p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {tenant.companies.map((company) => (
                                <div
                                    key={company.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background ${!company.active ? "opacity-60" : ""}`}
                                >
                                    <div className="flex items-center gap-2">
                                        {company.primaryColor && (
                                            <div
                                                className="w-4 h-4 rounded-full border border-border shrink-0"
                                                style={{ backgroundColor: company.primaryColor }}
                                            />
                                        )}
                                        <span className="text-sm text-foreground">{company.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setEditingCompany(company)} className="text-blue-500 hover:text-blue-700">
                                            <Pencil size={13} />
                                        </button>
                                        <button
                                            onClick={() => handleToggleCompany(company.id)}
                                            disabled={togglingCompany === company.id}
                                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${company.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                                        >
                                            {company.active ? "Ativa" : "Inativa"}
                                        </button>
                                        <button onClick={() => setDeletingCompany(company)} className="text-destructive hover:text-destructive/80">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Módulos */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h2 className="text-sm font-semibold text-foreground mb-4">Módulos</h2>
                    {coreModules.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Core — sempre ativos</p>
                            <div className="flex flex-col gap-2">
                                {coreModules.map((module) => (
                                    <div key={module.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                        <div>
                                            <p className="text-sm text-foreground">{module.name}</p>
                                            <p className="text-xs text-muted-foreground">{module.slug}</p>
                                        </div>
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">Core</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {optionalModules.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Opcionais</p>
                            <div className="flex flex-col gap-2">
                                {optionalModules.map((module) => (
                                    <div key={module.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                                        <div>
                                            <p className="text-sm text-foreground">{module.name}</p>
                                            <p className="text-xs text-muted-foreground">{module.slug}</p>
                                        </div>
                                        <button
                                            onClick={() => handleToggleModule(module.id, module.isCore)}
                                            disabled={togglingModule === module.id}
                                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors disabled:opacity-50 ${module.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                                        >
                                            {togglingModule === module.id ? "..." : module.active ? "Ativo" : "Inativo"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Dispositivos IoT */}
            <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Cpu size={16} className="text-muted-foreground" />
                        <h2 className="text-sm font-semibold text-foreground">Dispositivos IoT</h2>
                    </div>
                    <button
                        onClick={() => setShowCreateDevice(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={13} />
                        Novo
                    </button>
                </div>

                {devices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum dispositivo cadastrado.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {devices.map((device) => (
                            <div
                                key={device.id}
                                className={`flex items-center justify-between p-3 rounded-lg border border-border bg-background ${!device.active ? "opacity-60" : ""}`}
                            >
                                <div>
                                    <p className="text-sm text-foreground">{device.name}</p>
                                    <p className="text-xs text-muted-foreground">{device.type}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleSeedDevice(device.id)}
                                        disabled={seedingDevice === device.id}
                                        title="Popular dados mockados"
                                        className="text-xs flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg disabled:opacity-50"
                                    >
                                        <Database size={12} />
                                        {seedingDevice === device.id ? "..." : "Mock"}
                                    </button>
                                    <button
                                        onClick={() => handleClearDevice(device.id)}
                                        disabled={clearingDevice === device.id}
                                        title="Zerar leituras"
                                        className="text-xs flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg disabled:opacity-50"
                                    >
                                        <Eraser size={12} />
                                        {clearingDevice === device.id ? "..." : "Zerar"}
                                    </button>
                                    <button
                                        onClick={() => handleToggleDevice(device.id)}
                                        disabled={togglingDevice === device.id}
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${device.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
                                    >
                                        {device.active ? "Ativo" : "Inativo"}
                                    </button>
                                    <button
                                        onClick={() => setDeletingDevice(device)}
                                        className="text-destructive hover:text-destructive/80"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showCreateCompany && (
                <CreateCompanyModal
                    tenantId={tenant.id}
                    onClose={() => setShowCreateCompany(false)}
                    onSuccess={() => fetchTenant()}
                />
            )}

            <EditCompanyModal
                tenantId={tenant.id}
                company={editingCompany}
                onClose={() => setEditingCompany(null)}
                onSuccess={() => fetchTenant()}
            />

            {showCreateDevice && (
                <CreateDeviceModal
                    tenantId={tenant.id}
                    onClose={() => setShowCreateDevice(false)}
                    onSuccess={() => fetchDevices()}
                />
            )}

            <ConfirmDialog
                open={!!deletingCompany}
                title="Excluir empresa"
                description={`Tem certeza que deseja excluir a empresa "${deletingCompany?.name}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                loading={deleteLoading}
                onConfirm={handleDeleteCompany}
                onCancel={() => setDeletingCompany(null)}
            />

            <ConfirmDialog
                open={!!deletingDevice}
                title="Excluir dispositivo"
                description={`Tem certeza que deseja excluir o dispositivo "${deletingDevice?.name}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                loading={deleteDeviceLoading}
                onConfirm={handleDeleteDevice}
                onCancel={() => setDeletingDevice(null)}
            />
        </div>
    );
}