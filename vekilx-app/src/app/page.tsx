
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string;
};

const navigation = [
  ["⌂", "Ana Sayfa"],
  ["♡", "Match"],
  ["✉", "Mesajlar"],
  ["◎", "VEKLIX Gündemi"],
  ["♟", "Siyaset"],
  ["♧", "Topluluklar"],
];

export default function Home() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [active, setActive] = useState("Ana Sayfa");
  const [post, setPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [fallbackNickname, setFallbackNickname] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setUserId(null);
        setFallbackNickname(null);
        setAuthLoading(false);
        return;
      }

      const user = data.session?.user ?? null;

      setUserId(user?.id ?? null);
      setFallbackNickname(user?.user_metadata?.nickname ?? null);
    }

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const user = session?.user ?? null;

      setUserId(user?.id ?? null);
      setFallbackNickname(user?.user_metadata?.nickname ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function loadUserProfile() {
      if (!userId) {
        setUserNickname(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .maybeSingle();

      if (!mounted) return;

      if (!error && data?.nickname) {
        setUserNickname(data.nickname);
      } else {
        setUserNickname(fallbackNickname || "Vatandaş");
      }

      setAuthLoading(false);
    }

    loadUserProfile();

    return () => {
      mounted = false;
    };
  }, [supabase, userId, fallbackNickname]);

  async function loadPosts() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("posts")
      .select("id, user_id, content, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage("Gönderiler yüklenemedi: " + error.message);
      setLoading(false);
      return;
    }

    const userIds = [...new Set((data ?? []).map((item) => item.user_id))];

    let profileMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", userIds);

      if (!profileError && profiles) {
        profileMap = Object.fromEntries(
          profiles.map((profile) => [profile.id, profile.nickname])
        );
      }
    }

    setPosts(
      (data ?? []).map((item) => ({
        ...item,
        nickname: profileMap[item.user_id] || "Vatandaş",
      }))
    );

    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePost() {
    const content = post.trim();

    if (!content) {
      setMessage("Önce bir şeyler yazmalısın.");
      return;
    }

    if (content.length > 1000) {
      setMessage("Gönderin en fazla 1000 karakter olabilir.");
      return;
    }

    setPosting(true);
    setMessage("");

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setMessage("Gönderi paylaşmak için giriş yapmalısın.");
      setPosting(false);
      return;
    }

    const { error } = await supabase.from("posts").insert({
      user_id: userData.user.id,
      content,
    });

    if (error) {
      setMessage("Gönderi paylaşılamadı: " + error.message);
      setPosting(false);
      return;
    }

    setPost("");
    await loadPosts();
    setMessage("Gönderin VEKLIX'te yayınlandı!");
    setPosting(false);
  }

  async function handleDeletePost(postId: number) {
    const confirmed = window.confirm(
      "Bu gönderiyi silmek istediğine emin misin? Bu işlem geri alınamaz."
    );

    if (!confirmed) return;

    if (!userId) {
      setMessage("Gönderi silmek için giriş yapmalısın.");
      return;
    }

    setDeletingPostId(postId);
    setMessage("");

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (error) {
      setMessage("Gönderi silinemedi: " + error.message);
      setDeletingPostId(null);
      return;
    }

    await loadPosts();
    setMessage("Gönderin başarıyla silindi.");
    setDeletingPostId(null);
  }

  async function handleLogout() {
    setSigningOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage("Çıkış yapılamadı: " + error.message);
    } else {
      setMessage("VEKLIX oturumun kapatıldı.");
    }

    setSigningOut(false);
  }

  function handleNavigation(label: string) {
    setActive(label);

    if (label === "Match") {
      router.push("/match");
    }
  }

  return (
    <main className="min-h-screen bg-[#090b12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b12]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1450px] items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black">
              V
            </div>
            <span className="text-2xl font-black tracking-[0.18em]">
              VEKLIX
            </span>
          </div>

          <div className="hidden w-full max-w-md md:block">
            <input
              placeholder="VEKLIX'te ara..."
              className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {authLoading ? (
              <span className="text-sm text-gray-400">Yükleniyor...</span>
            ) : userNickname ? (
              <>
                <span className="max-w-[130px] truncate rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-300 sm:max-w-[180px] sm:px-4 sm:text-sm">
                  @{userNickname}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5 sm:px-4 sm:text-sm"
                >
                  {signingOut ? "Çıkılıyor..." : "Çıkış Yap"}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/5 sm:px-4 sm:text-sm"
                >
                  Giriş Yap
                </a>

                <a
                  href="/signup"
                  className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-500 sm:px-4 sm:text-sm"
                >
                  Kayıt Ol
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-6 px-5 py-7 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-2">
            <p className="mb-4 px-3 text-xs font-bold tracking-widest text-gray-500">
              MENÜ
            </p>

            {navigation.map(([icon, label]) => (
              <button
                key={label}
                onClick={() => handleNavigation(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  active === label
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {label}
                {label === "Match" && (
                  <span className="ml-auto rounded-full bg-pink-500/20 px-2 py-0.5 text-xs text-pink-300">
                    Yeni
                  </span>
                )}
              </button>
            ))}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-bold">Kendi hikâyeni yaz.</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                VEKLIX'te kim olduğunu sen belirlersin.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-[#211443] via-[#17132c] to-[#10121e] p-7 sm:p-10">
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold tracking-[0.3em] text-violet-300">
                VEKLIX'E HOŞ GELDİN
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                Maskeni tak.
                <br />
                <span className="text-violet-400">Oyuna katıl.</span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-300">
                Tanış, eşleş, sırlarını paylaş, ittifaklar kur.
                Bu evrende herkesin bir hikâyesi var.
              </p>

              <button
                onClick={() => router.push("/match")}
                className="mt-7 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold transition hover:bg-violet-500"
              >
                İnsanları keşfet →
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">VEKLIX Gündemi</h2>
              <p className="mt-1 text-xs text-gray-500">
                Evrenin nabzı burada atıyor.
              </p>
            </div>

            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400">
              Canlı akış
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141f] p-4">
            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              maxLength={1000}
              placeholder="Aklından neler geçiyor? Anonim olarak paylaş..."
              className="min-h-24 w-full resize-none bg-transparent text-sm outline-none placeholder:text-gray-600"
            />

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-gray-500">
                {post.length}/1000 karakter
              </span>

              <button
                onClick={handlePost}
                disabled={posting || !post.trim()}
                className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {posting ? "Paylaşılıyor..." : "Paylaş"}
              </button>
            </div>
          </div>

          {message && (
            <p className="rounded-xl border border-white/10 bg-[#11141f] p-3 text-sm text-violet-300">
              {message}
            </p>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[#11141f] p-6 text-center text-sm text-gray-400">
              Gönderiler yükleniyor...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#11141f] p-8 text-center">
              <p className="font-bold">Henüz gönderi yok.</p>
              <p className="mt-2 text-sm text-gray-500">
                VEKLIX'teki ilk hikâyeyi sen başlat.
              </p>
            </div>
          ) : (
            posts.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#11141f] p-5 transition hover:border-violet-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 font-bold">
                    {item.nickname[0]?.toUpperCase() || "V"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{item.nickname}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Vatandaş ·{" "}
                      {new Date(item.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  {userId === item.user_id && (
                    <button
                      onClick={() => handleDeletePost(item.id)}
                      disabled={deletingPostId === item.id}
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingPostId === item.id ? "Siliniyor..." : "Sil"}
                    </button>
                  )}

                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-violet-300">
                    GÜNDEM
                  </span>
                </div>

                <p className="my-5 whitespace-pre-wrap break-words text-sm leading-7 text-gray-200">
                  {item.content}
                </p>

                <div className="flex gap-5 border-t border-white/10 pt-4 text-xs text-gray-400">
                  <span>♥ Beğeni sistemi yakında</span>
                  <span>◯ Yorumlar yakında</span>
                  <span className="ml-auto">VEKLIX</span>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-2xl border border-white/10 bg-[#11141f] p-5">
            <h3 className="font-bold">VEKLIX'in Nabzı</h3>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Aktif vatandaş</span>
                <span className="font-bold">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Yeni eşleşmeler</span>
                <span className="font-bold">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gündem başlıkları</span>
                <span className="font-bold">—</span>
              </div>
            </div>

            <p className="mt-5 text-[11px] leading-5 text-gray-600">
              Canlı veriler geliştirilmeye devam ediyor.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141f] p-5">
            <h3 className="font-bold">Günün konusu</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              VEKLIX'te güven mi daha önemli, güç mü?
            </p>
            <span className="mt-3 inline-block text-xs text-violet-400">
              Yakında anketler
            </span>
          </div>

          <div className="px-2 text-[11px] leading-6 text-gray-600">
            VEKLIX © 2026
            <br />
            Anonim ol. Kendi hikâyeni yaz.
          </div>
        </aside>
      </div>
    </main>
  );
}
