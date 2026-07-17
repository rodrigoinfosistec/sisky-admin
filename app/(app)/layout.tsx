"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { useState } from "react";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleLogout() {
        localStorage.removeItem("admin_token");
        Cookies.remove("admin_token");
        router.push("/login");
    }

    return (
        <div className="min-h-screen flex bg-background">
            <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 shadow-md">
                <Sidebar onLogout={handleLogout} />
            </div>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div
                className={`fixed inset-y-0 left-0 w-64 z-30 shadow-xl transform transition-transform duration-300 lg:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Sidebar onLogout={handleLogout} onNavigate={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 lg:ml-64">
                <Header
                    sidebarOpen={sidebarOpen}
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    onLogout={handleLogout}
                />
                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}