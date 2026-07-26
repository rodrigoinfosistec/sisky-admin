"use client";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Props {
    tenantId: number;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateCompanyModal({ tenantId, onClose, onSuccess }: Props) {
    const [name, setName] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#111111");
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            await api.post(`/api/admin/tenants/${tenantId}/companies`, { name, primaryColor });
            toast.success("Empresa criada com sucesso!");
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.response?.data) {
                setErrors(Array.isArray(err.response.data) ? err.response.data : [err.response.data]);
            } else {
                toast.error("Erro ao criar empresa.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Nova Empresa</h2>

                {errors.length > 0 && (
                    <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg mb-4 flex flex-col gap-1">
                        {errors.map((error, i) => <span key={i}>{error}</span>)}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome da empresa"
                            className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Cor Primária</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-10 h-10 rounded-lg border border-input cursor-pointer"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                placeholder="#111111"
                                className="flex-1 border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? "Criando..." : "Criar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}