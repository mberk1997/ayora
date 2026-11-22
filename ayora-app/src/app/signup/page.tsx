
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdult, setIsAdult] = useState(false);
  const [acceptedResponsibility, setAcceptedResponsibility] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!isAdult) {
      setMessage("AYORA'ya katılmak için 18 yaşını doldurmalısın.");
      return;
    }
if (!acceptedResponsibility) {
  setMessage("Lütfen kullanım ve güvenlik sorumluluğu onayını kabul et.");
  return;
} 
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Kayıt başarılı! E-posta doğrulamanı kontrol et.");
    }

    setLoading(false);
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#080910",
      color: "white",
      padding: "24px",
    }}>
      <form onSubmit={handleSignup} style={{
        width: "100%",
        maxWidth: "420px",
        background: "#151522",
        padding: "32px",
        borderRadius: "18px",
        border: "1px solid #34304b",
      }}>
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          AYORA
        </h1>

        <p style={{ color: "#aaa", marginBottom: "28px" }}>
          Maskeni tak. Evrenine katıl.
        </p>

        <label>Takma adın</label>
        <input
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="LunarWolf"
          style={inputStyle}
        />

        <label>E-posta adresin</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@email.com"
          style={inputStyle}
        />

        <label>Şifren</label>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="En az 8 karakter"
          style={inputStyle}
        />

        <label style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          margin: "20px 0",
          fontSize: "14px",
        }}>
          <input
            type="checkbox"
            checked={isAdult}
            onChange={(e) => setIsAdult(e.target.checked)}
          />
          18 yaşını doldurduğumu onaylıyorum.
        </label>
<label style={{
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  margin: "16px 0",
  fontSize: "13px",
  color: "#aaa",
  lineHeight: "1.6"
}}>
  <input
    type="checkbox"
    checked={acceptedResponsibility}
    onChange={(e) => setAcceptedResponsibility(e.target.checked)}
  />
  Hesabımın güvenliğini sağlamaktan ve paylaştığım içeriklerden sorumlu olduğumu, AYORA'nın Gizlilik Politikası'nı ve Kullanım Şartları'nı kabul ediyorum.
</label>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            background: "#8528ff",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading ? "Kaydediliyor..." : "AYORA'ya Katıl"}
        </button>

        {message && (
          <p style={{ marginTop: "18px", color: "#c4a5ff" }}>
            {message}
          </p>
        )}
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "13px",
  margin: "8px 0 20px",
  borderRadius: "9px",
  border: "1px solid #39364d",
  background: "#0c0c16",
  color: "white",
  boxSizing: "border-box",
};
