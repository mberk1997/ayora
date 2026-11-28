
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Conversation = {
  id: number;
  user_one: string;
  user_two: string;
  nickname: string;
  initials: string;
};

type Message = {
  id: number;
  conversation_id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function MessagesPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId
  );

  const filteredConversations = conversations.filter((conversation) =>
    conversation.nickname.toLowerCase().includes(search.toLowerCase())
  );

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Oturum bilgisini kontrol et
  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error || !data.session?.user) {
        setUserId(null);
        setLoading(false);
        router.replace("/login");
        return;
      }

      setUserId(data.session.user.id);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUserId(null);
        router.replace("/login");
      } else {
        setUserId(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  // Gerçek sohbetleri yükle
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    async function loadConversations() {
      setLoading(true);
      setError("");

      const { data, error: conversationError } = await supabase
        .from("conversations")
        .select("id, user_one, user_two")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (conversationError) {
        setError("Sohbetler yüklenemedi: " + conversationError.message);
        setConversations([]);
        setLoading(false);
        return;
      }

      const rows = data ?? [];

      if (rows.length === 0) {
        setConversations([]);
        setActiveId(null);
        setLoading(false);
        return;
      }

      const otherUserIds = rows.map((conversation) =>
        conversation.user_one === userId
          ? conversation.user_two
          : conversation.user_one
      );

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", otherUserIds);

      if (!mounted) return;

      if (profileError) {
        setError("Kullanıcı profilleri yüklenemedi: " + profileError.message);
      }

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((profile) => [
          profile.id,
          profile.nickname || "Vatandaş",
        ])
      );

      const formatted: Conversation[] = rows.map((conversation) => {
        const otherUserId =
          conversation.user_one === userId
            ? conversation.user_two
            : conversation.user_one;

        const nickname = profileMap[otherUserId] || "Vatandaş";

        return {
          ...conversation,
          nickname,
          initials: nickname.charAt(0).toUpperCase() || "V",
        };
      });

      setConversations(formatted);

      setActiveId((previous) => {
        if (previous && formatted.some((item) => item.id === previous)) {
          return previous;
        }

        return formatted[0]?.id ?? null;
      });

      setLoading(false);
    }

    loadConversations();

    return () => {
      mounted = false;
    };
  }, [supabase, userId]);

  // Seçilen sohbetin mesajlarını yükle
  useEffect(() => {
    if (!activeId || !userId) {
      setMessages([]);
      return;
    }

    let mounted = true;

    async function loadMessages() {
      setLoadingMessages(true);
      setError("");

      const { data, error: messageError } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .eq("conversation_id", activeId)
        .order("created_at", { ascending: true });

      if (!mounted) return;

      if (messageError) {
        setMessages([]);
        setError("Mesajlar yüklenemedi: " + messageError.message);
      } else {
        setMessages(data ?? []);
      }

      setLoadingMessages(false);
    }

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [supabase, activeId, userId]);

  // Gerçek mesaj gönder
  async function sendMessage() {
    const body = messageText.trim();

    if (!body || !activeId || !userId || sending) return;

    if (body.length > 2000) {
      setError("Mesajın en fazla 2000 karakter olabilir.");
      return;
    }

    setSending(true);
    setError("");

    const { data, error: sendError } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeId,
        sender_id: userId,
        body,
      })
      .select("id, conversation_id, sender_id, body, created_at")
      .single();

    if (sendError) {
      setError(
        "Mesaj gönderilemedi. Arkadaşlık veya engelleme durumunu kontrol et. " +
          sendError.message
      );
      setSending(false);
      return;
    }

    setMessages((previous) => [...previous, data]);
    setMessageText("");
    setSending(false);
  }

  return (
    <main className="min-h-screen bg-[#101820] px-4 py-6 text-[#F0EDE5] sm:px-6">
      <div className="mx-auto max-w-[1350px]">
        <button
          onClick={() => router.push("/")}
          className="mb-5 text-sm font-semibold text-[#D3B879] transition hover:text-[#F0EDE5]"
        >
          ← Ana sayfaya dön
        </button>

        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.3em] text-[#D3B879]">
            VATANDAŞLAR ARASI İLETİŞİM
          </p>
          <h1 className="mt-2 text-3xl font-black">Mesajlar</h1>
          <p className="mt-2 text-sm text-[#A8ADA8]">
            Sohbetlerini yönet, fikirlerini paylaş, yeni bağlantılar kur.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid min-h-[650px] overflow-hidden rounded-3xl border border-[#B99A58]/20 bg-[#17231F] md:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            className={`border-b border-[#B99A58]/15 md:border-b-0 md:border-r ${
              activeConversation ? "hidden md:block" : "block"
            }`}
          >
            <div className="border-b border-[#B99A58]/15 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Sohbetlerin</h2>
                <span className="rounded-full border border-[#B99A58]/25 bg-[#142B24] px-2.5 py-1 text-xs text-[#D3B879]">
                  {conversations.length}
                </span>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Sohbetlerde ara..."
                className="mt-4 w-full rounded-xl border border-white/10 bg-[#101820] px-4 py-3 text-sm outline-none transition placeholder:text-[#A8ADA8]/60 focus:border-[#B99A58]"
              />
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                <p className="p-6 text-center text-sm text-[#A8ADA8]">
                  Sohbetler yükleniyor...
                </p>
              ) : filteredConversations.length === 0 ? (
                <div className="p-7 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#B99A58]/25 bg-[#142B24] text-2xl text-[#D3B879]">
                    ✉
                  </div>
                  <p className="mt-4 text-sm font-bold">
                    {search ? "Sohbet bulunamadı." : "Henüz sohbetin yok."}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#A8ADA8]">
                    Arkadaşlık isteğin kabul edildiğinde sohbetin burada
                    görünecek.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setActiveId(conversation.id)}
                    className={`flex w-full items-center gap-3 p-4 text-left transition hover:bg-[#1C2A25] ${
                      activeId === conversation.id ? "bg-[#1D3B30]/60" : ""
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#B99A58]/30 bg-[#142B24] text-lg font-bold text-[#D3B879]">
                      {conversation.initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {conversation.nickname}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#A8ADA8]">
                        Sohbeti açmak için dokun
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section
            className={`flex min-w-0 flex-col ${
              activeConversation ? "flex" : "hidden md:flex"
            }`}
          >
            {activeConversation ? (
              <>
                <header className="flex items-center gap-3 border-b border-[#B99A58]/15 p-4 sm:p-5">
                  <button
                    onClick={() => setActiveId(null)}
                    className="mr-1 text-[#D3B879] md:hidden"
                    aria-label="Sohbet listesine dön"
                  >
                    ←
                  </button>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B99A58]/30 bg-[#142B24] font-bold text-[#D3B879]">
                    {activeConversation.initials}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate font-bold">
                      {activeConversation.nickname}
                    </h2>
                    <p className="mt-1 text-xs text-[#A8ADA8]">
                      VEKİLX vatandaşı
                    </p>
                  </div>

                  <div className="ml-auto text-xs font-semibold tracking-wider text-[#D3B879]">
                    VEKİLX
                  </div>
                </header>

                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
                  <div className="mx-auto rounded-full border border-[#B99A58]/15 bg-[#101820] px-4 py-2 text-[10px] font-semibold tracking-wider text-[#A8ADA8]">
                    SOHBET
                  </div>

                  {loadingMessages ? (
                    <p className="py-8 text-center text-sm text-[#A8ADA8]">
                      Mesajlar yükleniyor...
                    </p>
                  ) : messages.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="font-bold">Henüz mesaj yok.</p>
                      <p className="mt-2 text-sm text-[#A8ADA8]">
                        İlk mesajı sen gönderebilirsin.
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const mine = message.sender_id === userId;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                              mine
                                ? "rounded-br-sm border border-[#B99A58]/30 bg-[#1D3B30] text-[#F0EDE5]"
                                : "rounded-bl-sm border border-white/10 bg-[#101820] text-[#F0EDE5]"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.body}
                            </p>
                            <p className="mt-2 text-right text-[10px] text-[#A8ADA8]">
                              {formatTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="border-t border-[#B99A58]/15 p-4 sm:p-5"
                >
                  <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#101820] p-2 focus-within:border-[#B99A58]/60">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      maxLength={2000}
                      rows={1}
                      placeholder="Mesajını yaz..."
                      className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#A8ADA8]/60"
                    />

                    <button
                      type="submit"
                      disabled={!messageText.trim() || sending}
                      className="rounded-xl bg-[#B99A58] px-4 py-3 text-sm font-bold text-[#142B24] transition hover:bg-[#D3B879] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sending ? "Gönderiliyor..." : "Gönder"}
                    </button>
                  </div>
                  <p className="mt-2 px-1 text-[10px] text-[#A8ADA8]/70">
                    Enter ile gönder · Shift + Enter ile yeni satır
                  </p>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#B99A58]/25 bg-[#142B24] text-3xl text-[#D3B879]">
                    ✉
                  </div>
                  <h2 className="mt-5 text-xl font-bold">
                    {loading ? "Sohbetler yükleniyor..." : "Bir sohbet seç"}
                  </h2>
                  <p className="mt-2 text-sm text-[#A8ADA8]">
                    {loading
                      ? "Lütfen bekle."
                      : "Mesajlarını görüntülemek için soldaki sohbetlerden birini seç."}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>

        <p className="mt-4 text-center text-xs text-[#A8ADA8]/60">
          VEKİLX © 2026 · Siyaset ciddi, biz değiliz.
        </p>
      </div>
    </main>
  );
}
