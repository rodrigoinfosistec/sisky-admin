"use client";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Props {
    tenantId: number;
    onClose: () => void;
    onSuccess: () => void;
}

const DEVICE_TYPES = [
    { value: "dht22", label: "DHT22 — Temperatura e Umidade" },
    { value: "hc_sr04", label: "HC-SR04 — Distância" },
    { value: "custom", label: "Custom — Personalizado" },
];

export default function CreateDeviceModal({ tenantId, onClose, onSuccess }: Props) {
    const [name, setName] = useState("");
    const [type, setType] = useState("dht22");
    const [errors, setErrors] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            const response = await api.post<{ id: number; apiKey: string }>(
                `/api/admin/tenants/${tenantId}/devices`,
                { name, type }
            );
            setApiKey(response.data.apiKey);
            onSuccess();
        } catch (err: any) {
            if (err.response?.data) {
                setErrors(Array.isArray(err.response.data) ? err.response.data : [err.response.data]);
            } else {
                toast.error("Erro ao criar dispositivo.");
            }
        } finally {
            setLoading(false);
        }
    }

    if (apiKey) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="fixed inset-0 bg-black/50" onClick={onClose} />
                <div className="relative bg-card border border-border rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                    <h2 className="text-lg font-semibold text-foreground mb-2">Dispositivo criado!</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Copie a API Key abaixo e grave no firmware do dispositivo.
                        <strong className="text-destructive"> Ela não será exibida novamente.</strong>
                    </p>

                    <div className="bg-muted rounded-lg p-3 mb-4">
                        <p className="text-xs text-muted-foreground mb-1">API Key</p>
                        <p className="text-sm font-mono break-all text-foreground">{apiKey}</p>
                    </div>

                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            toast.success("API Key copiada!");
                        }}
                        className="w-full px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted mb-3"
                    >
                        Copiar API Key
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-semibold text-foreground mb-4">Novo Dispositivo</h2>

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
                            placeholder="Ex: Sensor Sala 1"
                            className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {DEVICE_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
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