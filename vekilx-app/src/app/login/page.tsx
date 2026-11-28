
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/username-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.session) {
        setMessage(result.error || "Giriş yapılamadı. Bilgilerini kontrol et.");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (error) {
        setMessage("Oturum açılamadı: " + error.message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setMessage("Sunucuya bağlanılamadı. Biraz sonra tekrar dene.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#101820] px-5 py-10 text-[#F0EDE5]">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#1D3B30]/50 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#B99A58]/10 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <a href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D3B879]/50 bg-[#142B24] text-2xl font-black text-[#D3B879]">
            V
          </span>
          <span className="text-3xl font-black tracking-[0.18em]">
            VEKİLX
          </span>
        </a>

        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-[#B99A58]/25 bg-[#17231F]/95 p-7 shadow-2xl shadow-black/30 sm:p-9"
        >
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.3em] text-[#D3B879]">
              TEKRAR HOŞ GELDİN
            </p>

            <h1 className="mt-4 text-3xl font-black">
              Meclis seni bekliyor.
            </h1>

            <p className="mt-3 text-sm leading-6 text-[#A8ADA8]">
              VEKİLX'te sözün, fikrin ve hikâyen kaldığı yerden devam ediyor.
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-[#D8D8D0]">
            E-posta veya kullanıcı adı
          </label>

          <input
            required
            type="text"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="E-posta veya kullanıcı adın"
            className="mb-5 w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3.5 text-sm text-[#F0EDE5] outline-none transition placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]"
          />

          <label className="mb-2 block text-sm font-semibold text-[#D8D8D0]">
            Şifren
          </label>

          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreni gir"
            className="mb-5 w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3.5 text-sm text-[#F0EDE5] outline-none transition placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]"
          />

          {message && (
            <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-[#D3B879]/40 bg-[#B99A58] py-3.5 text-sm font-bold text-[#142B24] transition hover:bg-[#D3B879] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "VEKİLX'e Giriş Yap"}
          </button>

          <div className="my-7 border-t border-white/10" />

          <p className="text-center text-sm text-[#A8ADA8]">
            Henüz hesabın yok mu?{" "}
            <a
              href="/signup"
              className="font-bold text-[#D3B879] transition hover:text-[#F0EDE5]"
            >
              Hemen kayıt ol
            </a>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-[#A8ADA8]/70">
          VEKİLX © 2026 · Siyaset ciddi, biz değiliz.
        </p>
      </div>
    </main>
  );
}
