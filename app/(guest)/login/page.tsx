"use client";

import Cookies from "js-cookie";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/login", {
                email,
                password,
                rememberMe: false,
            });

            const token = response.data.token;

            localStorage.setItem("admin_token", token);
            Cookies.set("admin_token", token, { expires: 1 });

            router.push("/dashboard");
        } catch {
            setError("E-mail ou senha incorretos.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-md bg-card rounded-xl shadow-md p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-1">Sisky Admin</h2>
            <p className="text-muted-foreground mb-6 text-sm">Painel de administração global</p>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Senha</label>
                    <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-input bg-background text-foreground rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}