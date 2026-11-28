
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
          onSubmit={handleSignup}
          className="rounded-3xl border border-[#B99A58]/25 bg-[#17231F]/95 p-7 shadow-2xl shadow-black/30 sm:p-9"
        >
          <p className="text-xs font-bold tracking-[0.3em] text-[#D3B879]">
            SİYASET CİDDİ, BİZ DEĞİLİZ.
          </p>

          <h1 className="mt-5 text-3xl font-black">
            Cumhuriyete katıl.
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#A8ADA8]">
            Bir hesap oluştur, karakterini seç ve gündeme dahil ol.
            Burada herkesin söyleyecek bir sözü var.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#D8D8D0]">
                Kullanıcı adın
              </label>
              <input
                required
                minLength={3}
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Örneğin: gizli_vatandas"
                className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-[#F0EDE5] outline-none transition placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#D8D8D0]">
                E-posta adresin
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-[#F0EDE5] outline-none transition placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#D8D8D0]">
                Şifren
              </label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 8 karakter"
                className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-[#F0EDE5] outline-none transition placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#D8D8D0]">
                Şifreni tekrar gir
              </label>
              <input
                required
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreni tekrar yaz"
                className="w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm text-[#F0EDE5] outline-none transition placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]"
              />
            </div>
          </div>

          {message && (
            <p className="mt-5 rounded-xl border border-[#B99A58]/25 bg-[#142B24] p-3 text-sm leading-6 text-[#D3B879]">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-7 w-full rounded-xl border border-[#D3B879]/40 bg-[#B99A58] py-4 text-sm font-bold text-[#142B24] transition hover:bg-[#D3B879] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Hesabın oluşturuluyor..." : "VEKİLX'e Katıl"}
          </button>

          <div className="mt-7 border-t border-white/10 pt-6 text-center text-sm text-[#A8ADA8]">
            Zaten hesabın var mı?{" "}
            <a
              href="/login"
              className="font-bold text-[#D3B879] transition hover:text-[#F0EDE5]"
            >
              Giriş yap
            </a>
          </div>
        </form>

        <p className="mt-7 text-center text-xs text-[#A8ADA8]/70">
          VEKİLX © 2026 · Siyaset ciddi, biz değiliz.
        </p>
      </div>
    </main>
  );
}
