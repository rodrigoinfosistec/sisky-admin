"use client";

import { Menu, LogOut } from "lucide-react";

interface Props {
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    onLogout: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar, onLogout }: Props) {
    return (
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-8">
            <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            >
                <Menu size={20} />
            </button>

            <div className="hidden lg:block" />

            <button
                onClick={onLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <LogOut size={16} />
                Sair
            </button>
        </header>
    );
}