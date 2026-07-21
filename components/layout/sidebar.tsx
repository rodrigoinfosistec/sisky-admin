"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, LogOut, ClipboardList } from "lucide-react";
import Image from "next/image";

interface Props {
    onLogout: () => void;
    onNavigate?: () => void;
}

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tenants", label: "Tenants", icon: Building2 },
    { href: "/audit", label: "Auditoria", icon: ClipboardList },
];

export default function Sidebar({ onLogout, onNavigate }: Props) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full bg-card border-r border-border">
            <div className="p-6 border-b border-border">
                <Image src="/logo.svg" alt="Sisky Admin" width={120} height={32} />
                <p className="text-xs text-muted-foreground mt-2">Painel global</p>
            </div>

            <nav className="flex-1 p-4 flex flex-col gap-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </a>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
                >
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </div >
    );
}