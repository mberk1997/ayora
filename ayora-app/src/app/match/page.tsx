
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
    question: "AYORA'da öncelikli olarak ne arıyorsun?",
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
];

export default function MatchPage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [answers, setAnswers] = useState<Answers>({});
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
        setAnswers(data.answers as Answers);
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

      return {
        ...previous,
        [questionIndex]: updated,
      };
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
    const unanswered = questions.findIndex(
      (_, index) => !isAnswered(index)
    );

    if (unanswered !== -1) {
      setMessage(
        `Lütfen ${unanswered + 1}. soruyu da cevapla. Hassas sorularda "Paylaşmak istemiyorum" seçeneğini kullanabilirsin.`
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

    const { error } = await supabase
      .from("match_answers")
      .upsert(
        {
          user_id: userData.user.id,
          answers,
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
      <main className="min-h-screen bg-[#090b12] text-white grid place-items-center">
        <p className="text-gray-400">Match testi hazırlanıyor...</p>
      </main>
    );
  }

  const answeredCount = questions.filter((_, index) =>
    isAnswered(index)
  ).length;

  const categories = [...new Set(questions.map((q) => q.category))];

  return (
    <main className="min-h-screen bg-[#090b12] text-white px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push("/")}
          className="mb-6 text-sm text-violet-300 hover:text-white"
        >
          ← Ana sayfaya dön
        </button>

        <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-[#211443] to-[#10121e] p-7 sm:p-10">
          <p className="text-xs font-bold tracking-[0.3em] text-violet-300">
            AYORA MATCH
          </p>

          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Seni biraz tanıyalım.
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-300">
            Cevapların sayesinde sana daha uyumlu insanları keşfedebileceksin.
            Doğru veya yanlış cevap yok. Kendin olman yeterli.
          </p>

          <div className="mt-7">
            <div className="mb-2 flex justify-between text-xs text-gray-400">
              <span>Test ilerlemesi</span>
              <span>{answeredCount}/22</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-violet-500 transition-all"
                style={{ width: `${(answeredCount / 22) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-8">
          {categories.map((category) => (
            <section key={category}>
              <h2 className="mb-4 text-lg font-bold text-violet-300">
                {category}
              </h2>

              <div className="space-y-4">
                {questions.map((item, index) => {
                  if (item.category !== category) return null;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-[#11141f] p-5"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold leading-6">
                            <span className="mr-2 text-violet-400">
                              {index + 1}.
                            </span>
                            {item.question}
                          </p>

                          {item.multiSelect && (
                            <p className="mt-2 text-xs text-gray-500">
                              Birden fazla seçenek işaretleyebilirsin.
                            </p>
                          )}
                        </div>

                        {isAnswered(index) && (
                          <span className="shrink-0 text-xs text-green-400">
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
                                  ? "border-violet-500 bg-violet-600/20 text-violet-200"
                                  : "border-white/10 bg-white/[0.02] text-gray-300 hover:border-violet-500/50 hover:bg-white/5"
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
          <p className="mt-6 rounded-xl border border-white/10 bg-[#11141f] p-4 text-sm text-violet-300">
            {message}
          </p>
        )}

        <div className="mt-7 rounded-2xl border border-white/10 bg-[#11141f] p-5">
          <p className="text-sm leading-6 text-gray-400">
            Cevapların özel olarak saklanır. Din, siyasi görüş, cinsiyet ve
            eşleşme tercihlerin gibi hassas bilgiler gizli tutulur.
            Cevaplarını istediğin zaman güncelleyebilirsin.
          </p>

          <button
            onClick={saveAnswers}
            disabled={saving}
            className="mt-5 w-full rounded-xl bg-violet-600 px-5 py-4 font-bold transition hover:bg-violet-500 disabled:opacity-50"
          >
            {saving
              ? "Cevapların kaydediliyor..."
              : saved
                ? "Cevaplarımı güncelle"
                : "Testi tamamla"}
          </button>
        </div>
      </div>
    </main>
  );
}
