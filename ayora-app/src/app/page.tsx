
"use client";

import { useState } from "react";

const posts = [
  {
    user: "LunarWolf",
    role: "Vatandaş",
    time: "3 dakika önce",
    text: "AYORA'ya yeni geldim. Bakalım burada kimlerin maskesi düşecek. 👀",
    comments: 28,
    likes: 146,
    tag: "SOHBET",
  },
  {
    user: "NightOwl",
    role: "Muhalefet",
    time: "12 dakika önce",
    text: "Bazı insanlar seçim zamanı başka, seçim bittikten sonra bambaşka konuşuyor. Arşiv tutmayı unutmayın.",
    comments: 64,
    likes: 231,
    tag: "SİYASET",
  },
  {
    user: "Moonlight",
    role: "Vatandaş",
    time: "25 dakika önce",
    text: "Bir kahve, güzel bir sohbet ve biraz da kaos. Bugün planım bu. 🌙",
    comments: 17,
    likes: 89,
    tag: "SOSYAL",
  },
];

const navigation = [
  ["⌂", "Ana Sayfa"],
  ["♡", "Match"],
  ["✉", "Mesajlar"],
  ["◎", "AYORA Gündemi"],
  ["♟", "Siyaset"],
  ["♧", "Topluluklar"],
];

export default function Home() {
  const [active, setActive] = useState("Ana Sayfa");
  const [liked, setLiked] = useState<number[]>([]);
  const [post, setPost] = useState("");

  return (
    <main className="min-h-screen bg-[#090b12] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b12]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1450px] items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-black">A</div>
            <span className="text-2xl font-black tracking-[0.18em]">AYORA</span>
          </div>
          <div className="hidden w-full max-w-md md:block">
            <input
              placeholder="AYORA'da ara..."
              className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm outline-none focus:border-violet-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-gray-400 sm:block">ANONİM SOSYAL EVREN</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 font-bold">?</div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1450px] grid-cols-1 gap-6 px-5 py-7 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-2">
            <p className="mb-4 px-3 text-xs font-bold tracking-widest text-gray-500">MENÜ</p>
            {navigation.map(([icon, label]) => (
              <button
                key={label}
                onClick={() => setActive(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  active === label
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {label}
                {label === "Match" && <span className="ml-auto rounded-full bg-pink-500/20 px-2 py-0.5 text-xs text-pink-300">Yeni</span>}
              </button>
            ))}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm font-bold">Kendi hikâyeni yaz.</p>
              <p className="mt-2 text-xs leading-5 text-gray-500">AYORA'da kim olduğunu sen belirlersin.</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-[#211443] via-[#17132c] to-[#10121e] p-7 sm:p-10">
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="relative">
              <p className="text-xs font-bold tracking-[0.3em] text-violet-300">AYORA'YA HOŞ GELDİN</p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                Maskeni tak.<br />
                <span className="text-violet-400">Oyuna katıl.</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-gray-300">
                Tanış, eşleş, sırlarını paylaş, ittifaklar kur.
                Bu evrende herkesin bir hikâyesi var.
              </p>
              <button onClick={() => setActive("Match")} className="mt-7 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold transition hover:bg-violet-500">
                İnsanları keşfet →
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">AYORA Gündemi</h2>
              <p className="mt-1 text-xs text-gray-500">Evrenin nabzı burada atıyor.</p>
            </div>
            <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs text-green-400">Örnek akış</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141f] p-4">
            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              placeholder="Aklından neler geçiyor? Anonim olarak paylaş..."
              className="min-h-24 w-full resize-none bg-transparent text-sm outline-none placeholder:text-gray-600"
            />
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-gray-500">Anonim paylaşım taslağı</span>
              <button onClick={() => setPost("")} className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold hover:bg-violet-500">
                Taslağı temizle
              </button>
            </div>
          </div>

          {posts.map((item, index) => (
            <article key={item.user} className="rounded-2xl border border-white/10 bg-[#11141f] p-5 transition hover:border-violet-500/30">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-500 font-bold">
                  {item.user[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">{item.user}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.role} · {item.time}</p>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-violet-300">{item.tag}</span>
              </div>
              <p className="my-5 text-sm leading-7 text-gray-200">{item.text}</p>
              <div className="flex gap-5 border-t border-white/10 pt-4 text-xs text-gray-400">
                <button onClick={() => setLiked(old => old.includes(index) ? old.filter(x => x !== index) : [...old, index])} className={liked.includes(index) ? "text-pink-400" : "hover:text-pink-400"}>
                  ♥ {item.likes + (liked.includes(index) ? 1 : 0)}
                </button>
                <button onClick={() => setActive("Mesajlar")} className="hover:text-violet-300">◯ {item.comments} yorum</button>
                <span className="ml-auto">↗ Paylaş</span>
              </div>
            </article>
          ))}
        </section>

        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-2xl border border-white/10 bg-[#11141f] p-5">
            <h3 className="font-bold">AYORA'nın Nabzı</h3>
            <div className="mt-5 space-y-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Aktif vatandaş</span><span className="font-bold">—</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Yeni eşleşmeler</span><span className="font-bold">—</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Gündem başlıkları</span><span className="font-bold">—</span></div>
            </div>
            <p className="mt-5 text-[11px] leading-5 text-gray-600">Canlı veriler üyelik ve veritabanı sistemi kurulduğunda gösterilecek.</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#11141f] p-5">
            <h3 className="font-bold">Günün konusu</h3>
            <p className="mt-3 text-sm leading-6 text-gray-300">AYORA'da güven mi daha önemli, güç mü?</p>
            <span className="mt-3 inline-block text-xs text-violet-400">Yakında anketler</span>
          </div>

          <div className="px-2 text-[11px] leading-6 text-gray-600">
            AYORA © 2026<br />
            Anonim ol. Kendi hikâyeni yaz.
          </div>
        </aside>
      </div>
    </main>
  );
}
