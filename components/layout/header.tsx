"use client";

import { Menu, LogOut, Sun, Moon, UserCircle } from "lucide-react";
import { useTheme } from "next-themes";

interface AdminProfile {
    id: string;
    name: string;
    email: string;
    isSuperAdmin: boolean;
}

interface Props {
    profile: AdminProfile | null;
    sidebarOpen: boolean;
    onToggleSidebar: () => void;
    onLogout: () => void;
}

export default function Header({ profile, sidebarOpen, onToggleSidebar, onLogout }: Props) {
    const { theme, setTheme } = useTheme();

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