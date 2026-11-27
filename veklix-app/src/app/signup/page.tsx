
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const cleanNickname = nickname.trim();

    if (cleanNickname.length < 3 || cleanNickname.length > 20) {
      setMessage("Kullanıcı adın 3-20 karakter arasında olmalı.");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanNickname)) {
      setMessage("Kullanıcı adında sadece harf, rakam ve _ kullanabilirsin.");
      return;
    }

    if (password.length < 8) {
      setMessage("Şifren en az 8 karakter olmalı.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          nickname: cleanNickname,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      setMessage("Kayıt başarısız: " + error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setMessage(
      "Hesabın oluşturuldu! E-posta adresine gelen doğrulama bağlantısına tıkla."
    );

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#090b12] px-5 py-10 text-white">
      <div className="w-full max-w-md">

        <a href="/" className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-2xl font-black">
            V
          </div>
          <span className="text-3xl font-black tracking-[0.18em]">
            VEKLIX
          </span>
        </a>

        <form
          onSubmit={handleSignup}
          className="rounded-3xl border border-violet-500/20 bg-[#11141f] p-7 shadow-2xl sm:p-10"
        >
          <p className="text-xs font-bold tracking-[0.3em] text-violet-300">
            SİYASET CİDDİ, BİZ DEĞİLİZ.
          </p>

          <h1 className="mt-5 text-3xl font-black">
            Aramıza katıl.
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Bir hesap oluştur, karakterini seç ve gündeme dahil ol.
            Burada herkesin söyleyecek bir sözü var.
          </p>

          <div className="mt-8 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Kullanıcı adın
              </label>
              <input
                required
                minLength={3}
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Örneğin: gizli_vatandas"
                className="w-full rounded-xl border border-white/10 bg-[#090b12] px-4 py-3 text-sm outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                E-posta adresin
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full rounded-xl border border-white/10 bg-[#090b12] px-4 py-3 text-sm outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Şifren
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                className="w-full rounded-xl border border-white/10 bg-[#090b12] px-4 py-3 text-sm outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Şifreni tekrar gir
              </label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreni tekrar yaz"
                className="w-full rounded-xl border border-white/10 bg-[#090b12] px-4 py-3 text-sm outline-none transition focus:border-violet-500"
              />
            </div>

          </div>

          {message && (
            <p className="mt-5 rounded-xl border border-violet-500/20 bg-violet-500/10 p-3 text-sm leading-6 text-violet-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-violet-600 py-4 text-sm font-bold transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "Hesabın oluşturuluyor..." : "VEKLIX'e Katıl"}
          </button>

          <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-gray-400">
            Zaten hesabın var mı?{" "}
            <a
              href="/login"
              className="font-bold text-violet-400 hover:text-violet-300"
            >
              Giriş yap
            </a>
          </div>
        </form>

        <p className="mt-7 text-center text-xs text-gray-600">
          VEKLIX © 2026 · Siyaset ciddi, biz değiliz.
        </p>

      </div>
    </main>
  );
}
