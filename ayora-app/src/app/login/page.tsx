
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Giriş başarısız: " + error.message);
    } else {
      router.push("/");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090b12] px-5 py-10 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <a href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-2xl font-black">
            V
          </span>
          <span className="text-3xl font-black tracking-[0.18em]">
            VEKLIX
          </span>
        </a>

        <form
          onSubmit={handleLogin}
          className="rounded-3xl border border-violet-500/20 bg-[#11141f]/95 p-7 shadow-2xl shadow-violet-950/20 sm:p-9"
        >
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.3em] text-violet-300">
              TEKRAR HOŞ GELDİN
            </p>

            <h1 className="mt-4 text-3xl font-black">
              Maskeni yeniden tak.
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              VEKLIX evreninde hikâyene kaldığın yerden devam et.
            </p>
          </div>

          <label className="mb-2 block text-sm font-semibold text-gray-300">
            E-posta adresin
          </label>

          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            className="mb-5 w-full rounded-xl border border-white/10 bg-[#090b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
          />

          <label className="mb-2 block text-sm font-semibold text-gray-300">
            Şifren
          </label>

          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Şifreni gir"
            className="mb-5 w-full rounded-xl border border-white/10 bg-[#090b12] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-violet-500"
          />

          {message && (
            <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "VEKLIX'e Giriş Yap"}
          </button>

          <div className="my-7 border-t border-white/10" />

          <p className="text-center text-sm text-gray-400">
            Henüz hesabın yok mu?{" "}
            <a
              href="/signup"
              className="font-bold text-violet-400 transition hover:text-violet-300"
            >
              Hemen kayıt ol
            </a>
          </p>
        </form>

        <p className="mt-6 text-center text-xs text-gray-600">
          VEKLIX © 2026 · Anonim ol. Kendi hikâyeni yaz.
        </p>
      </div>
    </main>
  );
}
