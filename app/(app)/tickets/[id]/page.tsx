"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import PageTitle from "@/components/page-title";
import PageHeader from "@/components/page-header";

interface TicketMessage {
    id: number;
    userId: number;
    userName: string;
    message: string;
    isAdminReply: boolean;
    createdAt: string;
}

interface TicketDetails {
    id: number;
    tenantName: string;
    companyName: string;
    userName: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    messages: TicketMessage[];
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

export default function TicketDetailsPage() {
    const { id } = useParams();
    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    async function fetchTicket() {
        try {
            const response = await api.get<TicketDetails>(`/api/admin/tickets/${id}`);
            setTicket(response.data);
        } catch {
            toast.error("Erro ao carregar ticket.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim()) return;
        setSendingMessage(true);
        try {
            await api.post(`/api/admin/tickets/${id}/messages`, { message });
            setMessage("");
            fetchTicket();
        } catch {
            toast.error("Erro ao enviar mensagem.");
        } finally {
            setSendingMessage(false);
        }
    }

    async function handleUpdateStatus(status: string) {
        setUpdatingStatus(true);
        try {
            await api.patch(`/api/admin/tickets/${id}/status`, JSON.stringify(status), {
                headers: { "Content-Type": "application/json" }
            });
            toast.success("Status atualizado!");
            fetchTicket();
        } catch {
            toast.error("Erro ao atualizar status.");
        } finally {
            setUpdatingStatus(false);
        }
    }

    useEffect(() => {
        fetchTicket();
    }, [id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div>
            <PageTitle title={ticket.title} />

            <PageHeader
                title={ticket.title}
                icon={<LifeBuoy size={22} />}
                breadcrumb={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Tickets", href: "/tickets" },
                    { label: `#${ticket.id}` },
                ]}
                actions={
                    <a
                        href="/tickets"
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                    >
                        <ArrowLeft size={15} />
                        Voltar
                    </a>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Info */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-card rounded-xl border border-border p-5">
                        <h2 className="text-sm font-semibold text-foreground mb-4">Informações</h2>
                        <div className="flex flex-col gap-3 text-sm">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Status</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabels[ticket.status]?.color ?? "bg-muted text-muted-foreground"
                                    }`}>
                                    {statusLabels[ticket.status]?.label ?? ticket.status}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Prioridade</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityLabels[ticket.priority]?.color ?? "bg-muted text-muted-foreground"
                                    }`}>
                                    {priorityLabels[ticket.priority]?.label ?? ticket.priority}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Tenant</p>
                                <p className="text-foreground">{ticket.tenantName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Empresa</p>
                                <p className="text-foreground">{ticket.companyName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Aberto por</p>
                                <p className="text-foreground">{ticket.userName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Aberto em</p>
                                <p className="text-foreground">{new Date(ticket.createdAt).toLocaleString("pt-BR")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5">
                        <h2 className="text-sm font-semibold text-foreground mb-3">Alterar Status</h2>
                        <div className="flex flex-col gap-2">
                            {Object.entries(statusLabels).map(([key, val]) => (
                                <button
                                    key={key}
                                    onClick={() => handleUpdateStatus(key)}
                                    disabled={updatingStatus || ticket.status === key}
                                    className={`px-3 py-2 text-xs rounded-lg font-medium transition-colors disabled:opacity-40 ${ticket.status === key
                                        ? `${val.color} cursor-default`
                                        : "border border-border text-foreground hover:bg-muted"
                                        }`}
                                >
                                    {val.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card rounded-xl border border-border p-5">
                        <h2 className="text-sm font-semibold text-foreground mb-2">Descrição</h2>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                </div>

                {/* Mensagens */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-card rounded-xl border border-border p-5 flex flex-col gap-4 min-h-96">
                        <h2 className="text-sm font-semibold text-foreground">Mensagens</h2>

                        <div className="flex flex-col gap-3 flex-1">
                            {ticket.messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Nenhuma mensagem ainda.
                                </p>
                            ) : (
                                ticket.messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col gap-1 max-w-[80%] ${msg.isAdminReply ? "self-end" : "self-start"
                                            }`}
                                    >
                                        <div className={`rounded-xl px-4 py-3 text-sm ${msg.isAdminReply
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted text-foreground rounded-tl-none"
                                            }`}>
                                            {msg.message}
                                        </div>
                                        <p className={`text-xs text-muted-foreground ${msg.isAdminReply ? "text-right" : "text-left"
                                            }`}>
                                            {msg.isAdminReply ? "Suporte (você)" : msg.userName} · {new Date(msg.createdAt).toLocaleString("pt-BR")}
                                        </p>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {ticket.status !== "closed" && (
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Digite sua resposta..."
                                className="flex-1 border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <button
                                type="submit"
                                disabled={sendingMessage || !message.trim()}
                                className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {sendingMessage ? "Enviando..." : "Responder"}
                            </button>
                        </form>
                    )}

                    {ticket.status === "closed" && (
                        <p className="text-sm text-muted-foreground text-center">
                            Este ticket está fechado.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}