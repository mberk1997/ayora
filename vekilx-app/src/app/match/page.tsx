
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Answer = string | string[];
type Answers = Record<number, Answer>;

type Question = {
  category: string;
  question: string;
  options: string[];
  multiSelect?: boolean;
  optional?: boolean;
  political?: boolean;
};

const questions: Question[] = [
  {
    category: "Kişisel tercihler",
    question: "Hangi futbol takımını tutuyorsun?",
    options: ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Diğer", "Futbolla ilgilenmiyorum"],
  },
  {
    category: "Kişisel tercihler",
    question: "En çok hangi müzik türünü dinlersin?",
    options: ["Pop", "Rock / Metal", "Rap / Hip-hop", "Elektronik", "Klasik / Caz", "Her türden dinlerim"],
  },
  {
    category: "Kişisel tercihler",
    question: "Kendini nasıl tanımlarsın?",
    options: ["Gece insanıyım", "Sabah insanıyım", "İkisi de"],
  },
  {
    category: "İnanç ve dünya görüşü",
    question: "Dini ve inanç konularına yaklaşımın nasıl?",
    options: ["Dindarım", "İnançlıyım ama geleneksel değilim", "Spiritüel bir yaklaşımım var", "Agnostiğim", "Ateistim", "Paylaşmak istemiyorum"],
  },
  {
    category: "İnanç ve dünya görüşü",
    question: "Siyasi görüş senin için ne kadar önemli?",
    options: ["Çok önemli", "Bir ölçüde önemli", "Önemli değil", "Paylaşmak istemiyorum"],
  },
  {
    category: "İnanç ve dünya görüşü",
    question: "Farklı dünya görüşlerine sahip insanlarla anlaşabilir misin?",
    options: ["Evet, kesinlikle", "Kişiye bağlı", "Zorlanırım"],
  },
  {
    category: "İnanç ve dünya görüşü",
    question: "Hayatta senin için en önemli şey nedir?",
    options: ["Aile", "Özgürlük", "Başarı", "Aşk", "Huzur", "Maddi güvence"],
  },
  {
    category: "İlişki ve iletişim",
    question: "VEKİLX'te öncelikli olarak ne arıyorsun?",
    options: ["Ciddi ilişki", "Arkadaşlık", "Yeni insanlarla tanışmak", "Henüz karar vermedim"],
  },
  {
    category: "İlişki ve iletişim",
    question: "Bir ilişkide en çok neye önem verirsin?",
    options: ["Güven", "Sadakat", "İletişim", "Eğlence", "Ortak hedefler"],
  },
  {
    category: "İlişki ve iletişim",
    question: "Bir tartışma yaşadığında ne yaparsın?",
    options: ["Hemen konuşup çözerim", "Sakinleşmek için zaman isterim", "Karşı tarafın adım atmasını beklerim"],
  },
  {
    category: "İlişki ve iletişim",
    question: "Kıskançlık hakkında ne düşünüyorsun?",
    options: ["Bir miktar normaldir", "Güvensizlik göstergesidir", "İlişkiye göre değişir"],
  },
  {
    category: "İlişki ve iletişim",
    question: "İdeal ilişkin nasıl olmalı?",
    options: ["Birlikte çok vakit geçirmek", "Kişisel alanı korumak", "İkisinin dengesi"],
  },
  {
    category: "Sosyal yaşam",
    question: "Boş zamanlarında ne yapmayı tercih edersin?",
    options: ["Evde dinlenmek", "Arkadaşlarla buluşmak", "Gezmek ve keşfetmek", "Oyun oynamak", "Spor yapmak"],
  },
  {
    category: "Sosyal yaşam",
    question: "İdeal tatilin hangisi?",
    options: ["Deniz ve plaj", "Doğa ve kamp", "Büyük şehir gezisi", "Yurt dışı keşfi", "Evde dinlenmek"],
  },
  {
    category: "Sosyal yaşam",
    question: "Hayvanlarla aran nasıl?",
    options: ["Çok severim", "Severim", "Nötrüm", "Pek ilgilenmem"],
  },
  {
    category: "Sosyal yaşam",
    question: "Sosyal ortamlarda nasılsın?",
    options: ["Çok sosyalim", "Ortamına göre değişir", "Daha sakin ve içe dönüğüm"],
  },
  {
    category: "Gelecek ve beklentiler",
    question: "Gelecekte nasıl bir hayat istersin?",
    options: ["Sakin ve düzenli", "Macera dolu", "Kariyer odaklı", "Aile odaklı", "Özgür ve bağımsız"],
  },
  {
    category: "Gelecek ve beklentiler",
    question: "Para senin için ne ifade ediyor?",
    options: ["Güvenlik ve rahatlık", "Özgürlük", "Başarı göstergesi", "Hayatın önemli ama tek amacı değil"],
  },
  {
    category: "Gelecek ve beklentiler",
    question: "Seyahat etmek senin için ne kadar önemli?",
    options: ["Hayatımın önemli bir parçası", "Fırsat buldukça", "Çok ilgimi çekmiyor"],
  },
  {
    category: "Gelecek ve beklentiler",
    question: "Bir insanda seni en çok etkileyen özellik hangisi?",
    options: ["Mizah anlayışı", "Zekâ", "Merhamet", "Özgüven", "Dürüstlük", "Hayata bakış açısı"],
  },
  {
    category: "Cinsiyet ve eşleşme tercihleri",
    question: "Cinsiyetin nedir?",
    options: ["Kadın", "Erkek", "Non-binary", "Kendimi farklı şekilde tanımlıyorum", "Paylaşmak istemiyorum"],
  },
  {
    category: "Cinsiyet ve eşleşme tercihleri",
    question: "Hangi cinsiyetlerle eşleşmek istersin?",
    options: ["Kadın", "Erkek", "Non-binary", "Hepsi"],
    multiSelect: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Devlet ekonomide nasıl bir rol üstlenmeli?",
    options: ["Ekonomide aktif rol almalı", "Hem düzenlemeli hem özel sektöre alan açmalı", "Piyasa mümkün olduğunca serbest olmalı", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Vergi politikası konusunda hangisine yakınsın?",
    options: ["Daha yüksek vergi, daha kapsamlı kamu hizmeti", "Gelire göre dengeli ve adil vergi", "Daha düşük vergi, daha sınırlı devlet harcaması", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "İfade özgürlüğü hakkında düşüncen nedir?",
    options: ["Çok geniş biçimde korunmalı", "Özgürlük ile toplumsal güvenlik dengelenmeli", "Bazı konularda daha sıkı sınırlar olmalı", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Devlet bireylerin özel yaşam tercihlerine müdahale etmeli mi?",
    options: ["Hayır, bireysel özgürlük esas olmalı", "Sınırlı ve belirli durumlarda müdahale edebilir", "Toplumsal değerleri korumak için müdahale edebilir", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Göç politikası nasıl yürütülmeli?",
    options: ["Daha açık ve kapsayıcı olmalı", "Kontrollü ve dengeli yürütülmeli", "Daha sınırlayıcı olmalı", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Türkiye'nin yönetim sistemi hakkında hangisine yakınsın?",
    options: ["Güçlü parlamenter sistem", "Güçler ayrılığı güçlü başkanlık sistemi", "Mevcut sistemin iyileştirilmesi", "Farklı bir model", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Türkiye dış politikada öncelikle nasıl hareket etmeli?",
    options: ["Batı kurumları ve ittifaklarıyla yakın iş birliği", "Bağımsız ve çok yönlü dış politika", "Bölgesel iş birliklerine öncelik", "Denge politikası", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Siyasi görüş ve politik tercihler",
    question: "Gelenekler ve toplumsal değişim konusunda yaklaşımın nedir?",
    options: ["Gelenekler korunmalı", "Gelenekler ve değişim dengelenmeli", "Toplum değişime daha açık olmalı", "Paylaşmak istemiyorum"],
    political: true,
  },
  {
    category: "Kültürel kimlik",
    question: "Etnik veya kültürel aidiyetini nasıl tanımlarsın?",
    options: ["Türk", "Kürt", "Laz", "Göçmen", "Diğer", "Belirtmek istemiyorum"],
    optional: true,
  },
];

const POLITICAL_OPT_IN_KEY = "political_match_opt_in";

export default function MatchPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [answers, setAnswers] = useState<Answers>({});
  const [politicalMatchOptIn, setPoliticalMatchOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAnswers() {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (!mounted) return;

      if (sessionError || !sessionData.session?.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("match_answers")
        .select("answers, completed")
        .eq("user_id", sessionData.session.user.id)
        .maybeSingle();

      if (!mounted) return;

      if (!error && data?.answers) {
        const stored = data.answers as Record<string, unknown>;
        const restored: Answers = {};

        questions.forEach((_, index) => {
          const value = stored[String(index)];
          if (typeof value === "string" || Array.isArray(value)) {
            restored[index] = value as Answer;
          }
        });

        setAnswers(restored);
        setPoliticalMatchOptIn(stored[POLITICAL_OPT_IN_KEY] === true);
        setSaved(data.completed === true);
      } else if (error) {
        setMessage("Cevaplar yüklenemedi: " + error.message);
      }

      setLoading(false);
    }

    loadAnswers();

    return () => {
      mounted = false;
    };
  }, [supabase, router]);

  function chooseAnswer(questionIndex: number, answer: string) {
    setAnswers((previous) => ({
      ...previous,
      [questionIndex]: answer,
    }));
    setSaved(false);
    setMessage("");
  }

  function toggleMultiAnswer(questionIndex: number, answer: string) {
    setAnswers((previous) => {
      const current = previous[questionIndex];
      const selected = Array.isArray(current) ? current : [];
      let updated: string[];

      if (answer === "Hepsi") {
        updated = selected.includes("Hepsi") ? [] : ["Hepsi"];
      } else {
        const withoutAll = selected.filter((item) => item !== "Hepsi");
        updated = withoutAll.includes(answer)
          ? withoutAll.filter((item) => item !== answer)
          : [...withoutAll, answer];
      }

      return { ...previous, [questionIndex]: updated };
    });

    setSaved(false);
    setMessage("");
  }

  function isAnswered(index: number) {
    const answer = answers[index];
    if (Array.isArray(answer)) return answer.length > 0;
    return Boolean(answer);
  }

  function isSelected(index: number, option: string) {
    const answer = answers[index];
    if (Array.isArray(answer)) return answer.includes(option);
    return answer === option;
  }

  async function saveAnswers() {
    const unanswered = questions.findIndex((item, index) => {
      if (item.optional) return false;
      if (item.political && !politicalMatchOptIn) return false;
      return !isAnswered(index);
    });

    if (unanswered !== -1) {
      setMessage(
        `Lütfen ${unanswered + 1}. soruyu cevapla. Hassas sorularda "Paylaşmak istemiyorum" seçeneğini kullanabilirsin.`
      );
      return;
    }

    setSaving(true);
    setMessage("");

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setMessage("Oturumun sona ermiş. Lütfen tekrar giriş yap.");
      setSaving(false);
      return;
    }

    const storedAnswers = {
      ...answers,
      [POLITICAL_OPT_IN_KEY]: politicalMatchOptIn,
    };

    const { error } = await supabase
      .from("match_answers")
      .upsert(
        {
          user_id: userData.user.id,
          answers: storedAnswers,
          completed: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      setMessage("Cevaplar kaydedilemedi: " + error.message);
      setSaving(false);
      return;
    }

    setSaved(true);
    setMessage("Testin başarıyla kaydedildi! Artık Match'e hazırsın.");
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#101820] text-[#F0EDE5]">
        <p className="text-[#A8ADA8]">Match testi hazırlanıyor...</p>
      </main>
    );
  }

  const answeredCount = questions.filter((item, index) => {
    if (item.optional) return false;
    if (item.political && !politicalMatchOptIn) return false;
    return isAnswered(index);
  }).length;

  const requiredCount = questions.filter(
    (item) => !item.optional && (!item.political || politicalMatchOptIn)
  ).length;

  const categories = [...new Set(questions.map((q) => q.category))];
  const progress = requiredCount
    ? (answeredCount / requiredCount) * 100
    : 0;

  return (
    <main className="min-h-screen bg-[#101820] px-4 py-8 text-[#F0EDE5]">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm font-medium text-[#D3B879] transition hover:text-[#F0EDE5]"
        >
          ← Ana sayfaya dön
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-[#B99A58]/30 bg-gradient-to-br from-[#1D3B30] via-[#142B24] to-[#101820] p-7 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#B99A58]/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3B879]/40 bg-[#142B24] font-black text-[#D3B879]">
                V
              </div>
              <p className="text-xs font-bold tracking-[0.3em] text-[#D3B879]">
                VEKİLX MATCH
              </p>
            </div>

            <h1 className="mt-6 text-3xl font-black sm:text-4xl">
              Seni biraz tanıyalım.
            </h1>

            <p className="mt-4 text-sm leading-7 text-[#D8D8D0]">
              Cevapların sayesinde sana daha uyumlu insanları
              keşfedebileceksin. Doğru veya yanlış cevap yok.
              Kendin olman yeterli.
            </p>

            <div className="mt-7 rounded-2xl border border-[#B99A58]/25 bg-[#101820]/40 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-[#F0EDE5]">
                    Siyasi görüşüme göre eşleşmek istiyorum
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#A8ADA8]">
                    Bu tercih yalnızca siyasi cevaplarının eşleşme hesabında
                    kullanılıp kullanılmayacağını belirler. Siyasi sorular
                    her zaman görünür.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={politicalMatchOptIn}
                  onClick={() => {
                    setPoliticalMatchOptIn((value) => !value);
                    setSaved(false);
                    setMessage("");
                  }}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    politicalMatchOptIn ? "bg-[#B99A58]" : "bg-[#52605A]"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      politicalMatchOptIn ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl border border-[#B99A58]/20 bg-[#142B24] p-3">
                  <strong className="block text-lg text-[#D3B879]">%60</strong>
                  <span className="text-[#D8D8D0]">Siyasi uyum</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                  <strong className="block text-lg text-[#F0EDE5]">%40</strong>
                  <span className="text-[#A8ADA8]">Diğer uyum alanları</span>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-[#A8ADA8]">
                Tercihin sana aittir. Siyasi eşleşmeyi istediğin zaman
                açabilir veya kapatabilirsin.
              </p>
            </div>

            <div className="mt-7">
              <div className="mb-2 flex justify-between text-xs text-[#A8ADA8]">
                <span>Test ilerlemesi</span>
                <span>{answeredCount}/{requiredCount}</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#B99A58] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 border-b border-[#B99A58]/20 pb-3 text-lg font-bold text-[#D3B879]">
                {category}
              </h2>

              <div className="space-y-4">
                {questions.map((item, index) => {
                  if (item.category !== category) return null;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-[#17231F] p-5 transition hover:border-[#B99A58]/30"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold leading-6 text-[#F0EDE5]">
                            <span className="mr-2 text-[#D3B879]">
                              {index + 1}.
                            </span>
                            {item.question}
                          </p>

                          {item.multiSelect && (
                            <p className="mt-2 text-xs text-[#A8ADA8]">
                              Birden fazla seçenek işaretleyebilirsin.
                            </p>
                          )}

                          {item.optional && (
                            <p className="mt-2 text-xs text-[#A8ADA8]">
                              İsteğe bağlıdır. Boş bırakabilirsin.
                            </p>
                          )}

                          {item.political && !politicalMatchOptIn && (
                            <p className="mt-2 text-xs text-[#A8ADA8]">
                              İsteğe bağlıdır. Siyasi eşleşme kapalıyken bu
                              cevaplar uyum hesabında kullanılmaz.
                            </p>
                          )}
                        </div>

                        {isAnswered(index) && (
                          <span className="shrink-0 text-sm font-bold text-[#D3B879]">
                            ✓
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {item.options.map((option) => {
                          const selected = isSelected(index, option);

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                item.multiSelect
                                  ? toggleMultiAnswer(index, option)
                                  : chooseAnswer(index, option)
                              }
                              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                                selected
                                  ? "border-[#B99A58] bg-[#142B24] text-[#D3B879]"
                                  : "border-white/10 bg-[#101820]/50 text-[#D8D8D0] hover:border-[#B99A58]/50 hover:bg-[#1C2A25]"
                              }`}
                            >
                              {selected ? "✓ " : ""}
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {message && (
          <p className="mt-6 rounded-xl border border-[#B99A58]/25 bg-[#17231F] p-4 text-sm text-[#D3B879]">
            {message}
          </p>
        )}

        <div className="mt-7 rounded-2xl border border-[#B99A58]/20 bg-[#17231F] p-5">
          <p className="text-sm leading-6 text-[#A8ADA8]">
            Cevapların özel olarak saklanır. Din, siyasi görüş, cinsiyet ve
            kültürel kimlik gibi hassas bilgileri paylaşmak zorunda değilsin.
            Siyasi eşleşme iznini istediğin zaman değiştirebilirsin.
            Cevaplarını da istediğin zaman güncelleyebilirsin.
          </p>

          <button
            onClick={saveAnswers}
            disabled={saving}
            className="mt-5 w-full rounded-xl border border-[#D3B879]/40 bg-[#B99A58] px-5 py-4 font-bold text-[#142B24] transition hover:bg-[#D3B879] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Cevapların kaydediliyor..."
              : saved
                ? "Cevaplarımı güncelle"
                : "Testi tamamla"}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-[#A8ADA8]/70">
          VEKİLX · Siyaset ciddi, biz değiliz.
        </p>
      </div>
    </main>
  );
}
