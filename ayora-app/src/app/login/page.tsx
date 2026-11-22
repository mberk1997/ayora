
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
    <main style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#080910",
      color: "white",
      padding: "24px"
    }}>
      <form onSubmit={handleLogin} style={{
        width: "100%",
        maxWidth: "420px",
        background: "#151522",
        padding: "32px",
        borderRadius: "18px",
        border: "1px solid #34304b"
      }}>
        <h1 style={{ fontSize: "36px" }}>AYORA</h1>
        <p style={{ color: "#aaa", marginBottom: "28px" }}>
          Yeniden evrenine hoş geldin.
        </p>

        <label>E-posta adresin</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label>Şifren</label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {message && <p style={{ color: "#ff7777" }}>{message}</p>}

        <button type="submit" disabled={loading} style={buttonStyle}>
          {loading ? "Giriş yapılıyor..." : "AYORA'ya Giriş Yap"}
        </button>

        <p style={{ color: "#aaa", marginTop: "20px" }}>
          Henüz hesabın yok mu?{" "}
          <a href="/signup" style={{ color: "#a879ff" }}>
            Kayıt ol
          </a>
        </p>
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

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "15px",
  background: "#8725ff",
  color: "white",
  border: "none",
  borderRadius: "9px",
  fontWeight: "bold",
  cursor: "pointer",
};
