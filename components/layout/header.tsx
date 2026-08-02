"use client";

import { Menu, LogOut, Sun, Moon, UserCircle, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AdminProfile {
    id: string;
    name: string;
    email: string;
    isSuperAdmin: boolean;
}

interface PendingTicket {
    id: number;
    title: string;
    tenantName: string;
    companyName: string;
    status: string;
    priority: string;
    updatedAt: string;
}

interface Props {
    profile: AdminProfile | null;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    onLogout: () => void;
}

export default function Header({ profile, sidebarOpen, onToggleSidebar, onLogout }: Props) {
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [pendingTickets, setPendingTickets] = useState<PendingTicket[]>([]);
    const [notifOpen, setNotifOpen] = useState(false);

    const fetchPendingTickets = useCallback(async () => {
        try {
            const response = await api.get<PendingTicket[]>("/api/admin/tickets/pending");
            setPendingTickets(response.data);
        } catch { }
    }, []);

    useEffect(() => {
        fetchPendingTickets();
        const interval = setInterval(fetchPendingTickets, 30000);
        return () => clearInterval(interval);
    }, [fetchPendingTickets]);

    useEffect(() => {
        function handleTicketViewed(e: CustomEvent) {
            setPendingTickets((prev) => prev.filter((t) => t.id !== e.detail.ticketId));
        }
        window.addEventListener("ticket-viewed", handleTicketViewed as EventListener);
        return () => window.removeEventListener("ticket-viewed", handleTicketViewed as EventListener);
    }, []);

    function getPriorityColor(priority: string) {
        switch (priority) {
            case "urgent": return "text-red-500";
            case "high": return "text-orange-500";
            case "medium": return "text-yellow-500";
            default: return "text-muted-foreground";
        }
    }

    return (
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
            <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
                <Menu size={20} />
            </button>

            <div className="hidden lg:block" />

            <div className="flex items-center gap-3">
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                {/* Sino de tickets pendentes */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                        <Bell size={18} className="text-muted-foreground" />
                        {pendingTickets.length > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                                {pendingTickets.length > 9 ? "9+" : pendingTickets.length}
                            </span>
                        )}
                    </button>

                    {notifOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setNotifOpen(false)}
                            />
                            <div className="absolute right-0 top-12 z-20 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                                <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
                                    <p className="text-sm font-semibold text-foreground">Tickets pendentes</p>
                                    <span className="text-xs text-muted-foreground">{pendingTickets.length} aguardando</span>
                                </div>

                                {pendingTickets.length === 0 ? (
                                    <div className="px-3 py-6 text-center">
                                        <Bell size={24} className="text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">Nenhum ticket pendente</p>
                                    </div>
                                ) : (
                                    <div className="max-h-80 overflow-y-auto">
                                        {pendingTickets.map((ticket) => (
                                            <div
                                                key={ticket.id}
                                                onClick={() => {
                                                    router.push(`/tickets/${ticket.id}`);
                                                    setNotifOpen(false);
                                                }}
                                                className="px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">{ticket.title}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{ticket.tenantName} — {ticket.companyName}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            {new Date(ticket.updatedAt).toLocaleString("pt-BR")}
                                                        </p>
                                                    </div>
                                                    <span className={`text-xs font-medium shrink-0 ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="px-3 py-2 border-t border-border">
                                    <button
                                        onClick={() => {
                                            router.push("/tickets");
                                            setNotifOpen(false);
                                        }}
                                        className="w-full text-xs text-primary hover:underline text-center"
                                    >
                                        Ver todos os tickets
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {profile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                        <UserCircle size={18} className="text-muted-foreground" />
                        <div className="hidden sm:block">
                            <p className="text-xs font-medium text-foreground">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted"
                >
                    <LogOut size={16} />
                    <span className="hidden sm:block">Sair</span>
                </button>
            </div>
        </header>
    );
}