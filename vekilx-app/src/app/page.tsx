
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Comment = {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string;
};
 
type Reply = {
  id: number;
  comment_id: number;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string;
};

type FriendRequest = {
  id: number;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  nickname?: string;
};

type Post = {
  id: number;
  user_id: string;
  content: string;
  created_at: string;
  nickname: string;
  likes_count: number;
  liked_by_me: boolean;
  comments_count: number;
};

const navigation = [
  ["◎", "VEKİLX Gündemi"],
  ["✉", "Mesajlar"],
  ["♡", "Match"],
];

export default function Home() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [active, setActive] = useState("VEKİLX Gündemi");
  const [post, setPost] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<
    Record<number, Comment[]>
  >({});
  const [commentDrafts, setCommentDrafts] = useState<
    Record<number, string>
  >({});
  const [openComments, setOpenComments] = useState<number[]>([]);
  const [repliesByComment, setRepliesByComment] = useState<
    Record<number, Reply[]>
  >({});
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [replyingCommentId, setReplyingCommentId] = useState<number | null>(null);
  const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friendRequestBusyId, setFriendRequestBusyId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState<string | null>(null);
  const [fallbackNickname, setFallbackNickname] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [likingPostId, setLikingPostId] = useState<number | null>(null);
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );

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

    const postData = data ?? [];
    const postIds = postData.map((item) => item.id);

    const userIds = new Set<string>(
      postData.map((item) => item.user_id)
    );

    let profileMap: Record<string, string> = {};
    let likeCounts: Record<number, number> = {};
    let likedPostIds = new Set<number>();
    let commentCounts: Record<number, number> = {};
    let loadedComments: Comment[] = [];
    let loadedReplies: Reply[] = [];

    const { data: currentUserData } = await supabase.auth.getUser();
    const currentUserId = currentUserData.user?.id ?? null;
    let loadedFriendRequests: FriendRequest[] = [];

    if (currentUserId) {
      const { data: requests, error: requestsError } = await supabase
        .from("friend_requests")
        .select("id, sender_id, receiver_id, status, created_at, updated_at")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (!requestsError && requests) {
        loadedFriendRequests = requests as FriendRequest[];
        requests.forEach((request) => {
          userIds.add(request.sender_id);
          userIds.add(request.receiver_id);
        });
      } else if (requestsError) {
        console.error("Arkadaşlık istekleri yüklenemedi:", requestsError.message);
      }
    }

    if (postIds.length > 0) {
      const { data: likes, error: likesError } = await supabase
        .from("post_likes")
        .select("post_id, user_id")
        .in("post_id", postIds);

      if (!likesError && likes) {
        likes.forEach((like) => {
          likeCounts[like.post_id] =
            (likeCounts[like.post_id] || 0) + 1;

          if (like.user_id === currentUserId) {
            likedPostIds.add(like.post_id);
          }
        });
      } else if (likesError) {
        console.error("Beğeniler yüklenemedi:", likesError.message);
      }

      const { data: comments, error: commentsError } = await supabase
        .from("post_comments")
        .select("id, post_id, user_id, content, created_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: true });

      if (!commentsError && comments) {
        loadedComments = comments.map((comment) => ({
          ...comment,
          nickname: "",
        }));

        comments.forEach((comment) => {
          commentCounts[comment.post_id] =
            (commentCounts[comment.post_id] || 0) + 1;

          userIds.add(comment.user_id);
        });
      } else if (commentsError) {
        setMessage("Yorumlar yüklenemedi: " + commentsError.message);
      }

      const commentIds = loadedComments.map((comment) => comment.id);

      if (commentIds.length > 0) {
        const { data: replies, error: repliesError } = await supabase
          .from("comment_replies")
          .select("id, comment_id, user_id, content, created_at")
          .in("comment_id", commentIds)
          .order("created_at", { ascending: true });

        if (!repliesError && replies) {
          loadedReplies = replies.map((reply) => ({
            ...reply,
            nickname: "",
          }));
          replies.forEach((reply) => userIds.add(reply.user_id));
        } else if (repliesError) {
          setMessage("Yorum yanıtları yüklenemedi: " + repliesError.message);
        }
      }
    }

    if (userIds.size > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", Array.from(userIds));

      if (!profileError && profiles) {
        profileMap = Object.fromEntries(
          profiles.map((profile) => [profile.id, profile.nickname])
        );
      }
    }

    setPosts(
      postData.map((item) => ({
        ...item,
        nickname: profileMap[item.user_id] || "Vatandaş",
        likes_count: likeCounts[item.id] || 0,
        liked_by_me: likedPostIds.has(item.id),
        comments_count: commentCounts[item.id] || 0,
      }))
    );

    const groupedComments: Record<number, Comment[]> = {};

    loadedComments.forEach((comment) => {
      if (!groupedComments[comment.post_id]) {
        groupedComments[comment.post_id] = [];
      }

      groupedComments[comment.post_id].push({
        ...comment,
        nickname: profileMap[comment.user_id] || "Vatandaş",
      });
    });

    setCommentsByPost(groupedComments);

    const groupedReplies: Record<number, Reply[]> = {};

    loadedReplies.forEach((reply) => {
      if (!groupedReplies[reply.comment_id]) {
        groupedReplies[reply.comment_id] = [];
      }

      groupedReplies[reply.comment_id].push({
        ...reply,
        nickname: profileMap[reply.user_id] || "Vatandaş",
      });
    });

    setRepliesByComment(groupedReplies);
    setFriendRequests(
      loadedFriendRequests.map((request) => ({
        ...request,
        nickname:
          profileMap[
            request.sender_id === currentUserId
              ? request.receiver_id
              : request.sender_id
          ] || "Vatandaş",
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
    setMessage("Gönderin VEKİLX'te yayınlandı!");
    setPosting(false);
  }

  async function handleLike(postId: number) {
    if (!userId) {
      setMessage("Gönderileri beğenmek için giriş yapmalısın.");
      return;
    }

    if (likingPostId !== null) return;

    const selectedPost = posts.find((item) => item.id === postId);

    if (!selectedPost) return;

    setLikingPostId(postId);
    setMessage("");

    if (selectedPost.liked_by_me) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        setMessage("Beğeni geri alınamadı: " + error.message);
        setLikingPostId(null);
        return;
      }

      setPosts((previous) =>
        previous.map((item) =>
          item.id === postId
            ? {
                ...item,
                liked_by_me: false,
                likes_count: Math.max(0, item.likes_count - 1),
              }
            : item
        )
      );
    } else {
      const { error } = await supabase.from("post_likes").insert({
        post_id: postId,
        user_id: userId,
      });

      if (error) {
        setMessage("Gönderi beğenilemedi: " + error.message);
        setLikingPostId(null);
        return;
      }

      setPosts((previous) =>
        previous.map((item) =>
          item.id === postId
            ? {
                ...item,
                liked_by_me: true,
                likes_count: item.likes_count + 1,
              }
            : item
        )
      );
    }

    setLikingPostId(null);
  }

  function toggleComments(postId: number) {
    setOpenComments((previous) =>
      previous.includes(postId)
        ? previous.filter((id) => id !== postId)
        : [...previous, postId]
    );
  }

  async function handleComment(postId: number) {
    const content = (commentDrafts[postId] || "").trim();

    if (!content) return;

    if (content.length > 1000) {
      setMessage("Yorumun en fazla 1000 karakter olabilir.");
      return;
    }

    if (!userId) {
      setMessage("Yorum yazmak için giriş yapmalısın.");
      router.push("/login");
      return;
    }

    if (commentingPostId !== null) return;

    setCommentingPostId(postId);
    setMessage("");

    const { data, error } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content,
      })
      .select("id, post_id, user_id, content, created_at")
      .single();

    if (error) {
      setMessage("Yorum gönderilemedi: " + error.message);
      setCommentingPostId(null);
      return;
    }

    const newComment: Comment = {
      ...data,
      nickname: userNickname || fallbackNickname || "Vatandaş",
    };

    setCommentsByPost((previous) => ({
      ...previous,
      [postId]: [...(previous[postId] || []), newComment],
    }));

    setPosts((previous) =>
      previous.map((item) =>
        item.id === postId
          ? { ...item, comments_count: item.comments_count + 1 }
          : item
      )
    );

    setCommentDrafts((previous) => ({
      ...previous,
      [postId]: "",
    }));

    setCommentingPostId(null);
  }

  async function handleReply(comment: Comment) {
    const content = (replyDrafts[comment.id] || "").trim();

    if (!content) return;

    if (content.length > 1000) {
      setMessage("Yanıtın en fazla 1000 karakter olabilir.");
      return;
    }

    if (!userId) {
      setMessage("Yanıt yazmak için giriş yapmalısın.");
      router.push("/login");
      return;
    }

    if (replyingCommentId !== null) return;

    setReplyingCommentId(comment.id);
    setMessage("");

    const { data, error } = await supabase
      .from("comment_replies")
      .insert({
        comment_id: comment.id,
        user_id: userId,
        content,
      })
      .select("id, comment_id, user_id, content, created_at")
      .single();

    if (error) {
      setMessage("Yanıt gönderilemedi: " + error.message);
      setReplyingCommentId(null);
      return;
    }

    const newReply: Reply = {
      ...data,
      nickname: userNickname || fallbackNickname || "Vatandaş",
    };

    setRepliesByComment((previous) => ({
      ...previous,
      [comment.id]: [...(previous[comment.id] || []), newReply],
    }));

    setReplyDrafts((previous) => ({
      ...previous,
      [comment.id]: "",
    }));

    setReplyingCommentId(null);
  }

  async function handleDeleteReply(reply: Reply) {
    if (!userId || reply.user_id !== userId) return;

    const confirmed = window.confirm(
      "Bu yanıtı silmek istediğine emin misin?"
    );

    if (!confirmed) return;

    setDeletingReplyId(reply.id);
    setMessage("");

    const { error } = await supabase
      .from("comment_replies")
      .delete()
      .eq("id", reply.id)
      .eq("user_id", userId);

    if (error) {
      setMessage("Yanıt silinemedi: " + error.message);
      setDeletingReplyId(null);
      return;
    }

    setRepliesByComment((previous) => ({
      ...previous,
      [reply.comment_id]: (previous[reply.comment_id] || []).filter(
        (item) => item.id !== reply.id
      ),
    }));

    setDeletingReplyId(null);
  }

  async function handleDeleteComment(comment: Comment) {
    if (!userId || comment.user_id !== userId) return;

    const confirmed = window.confirm(
      "Bu yorumu silmek istediğine emin misin?"
    );

    if (!confirmed) return;

    setDeletingCommentId(comment.id);
    setMessage("");

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", comment.id)
      .eq("user_id", userId);

    if (error) {
      setMessage("Yorum silinemedi: " + error.message);
      setDeletingCommentId(null);
      return;
    }

    setCommentsByPost((previous) => ({
      ...previous,
      [comment.post_id]: (previous[comment.post_id] || []).filter(
        (item) => item.id !== comment.id
      ),
    }));

    setRepliesByComment((previous) => {
      const updated = { ...previous };
      delete updated[comment.id];
      return updated;
    });

    setPosts((previous) =>
      previous.map((item) =>
        item.id === comment.post_id
          ? {
              ...item,
              comments_count: Math.max(0, item.comments_count - 1),
            }
          : item
      )
    );

    setDeletingCommentId(null);
  }

  async function handleSendFriendRequest(receiverId: string) {
    if (!userId) {
      setMessage("Arkadaşlık isteği göndermek için giriş yapmalısın.");
      router.push("/login");
      return;
    }

    if (receiverId === userId || friendRequestBusyId !== null) return;

    const existing = friendRequests.find(
      (request) =>
        (request.sender_id === userId && request.receiver_id === receiverId) ||
        (request.sender_id === receiverId && request.receiver_id === userId)
    );

    if (existing?.status === "accepted") {
      setMessage("Bu vatandaşla zaten arkadaşsınız.");
      return;
    }

    if (existing?.status === "pending") {
      setMessage(
        existing.sender_id === userId
          ? "Bu vatandaşa zaten arkadaşlık isteği gönderdin."
          : "Bu vatandaştan bekleyen bir arkadaşlık isteğin var."
      );
      return;
    }

    setFriendRequestBusyId(receiverId);
    setMessage("");

    const { data, error } = await supabase
      .from("friend_requests")
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        status: "pending",
      })
      .select("id, sender_id, receiver_id, status, created_at, updated_at")
      .single();

    if (error) {
      setMessage("Arkadaşlık isteği gönderilemedi: " + error.message);
      setFriendRequestBusyId(null);
      return;
    }

    setFriendRequests((previous) => [
      {
        ...(data as FriendRequest),
        nickname:
          posts.find((item) => item.user_id === receiverId)?.nickname ||
          "Vatandaş",
      },
      ...previous,
    ]);
    setMessage("Arkadaşlık isteğin gönderildi.");
    setFriendRequestBusyId(null);
  }

  async function handleFriendRequestResponse(
    request: FriendRequest,
    status: "accepted" | "rejected"
  ) {
    if (!userId || request.receiver_id !== userId) return;
    if (friendRequestBusyId !== null) return;

    setFriendRequestBusyId(String(request.id));
    setMessage("");

    const { error } = await supabase
      .from("friend_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", request.id)
      .eq("receiver_id", userId)
      .eq("status", "pending");

    if (error) {
      setMessage("Arkadaşlık isteği güncellenemedi: " + error.message);
      setFriendRequestBusyId(null);
      return;
    }

    setFriendRequests((previous) =>
      previous.map((item) =>
        item.id === request.id ? { ...item, status } : item
      )
    );
    setMessage(
      status === "accepted"
        ? `${request.nickname || "Vatandaş"} artık arkadaşın.`
        : "Arkadaşlık isteği reddedildi."
    );
    setFriendRequestBusyId(null);
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
      setMessage("VEKİLX oturumun kapatıldı.");
    }

    setSigningOut(false);
  }

  function handleNavigation(label: string) {
    setActive(label);

    if (label === "VEKİLX Gündemi") {
      router.push("/");
    } else if (label === "Mesajlar") {
      router.push("/messages");
    } else if (label === "Match") {
      router.push("/match");
    }
  }

  return (
    <main className="min-h-screen bg-[#101820] text-[#F0EDE5]">
      <header className="sticky top-0 z-20 border-b border-[#B99A58]/20 bg-[#101820]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1450px] items-center justify-between gap-3 px-5">
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D3B879]/50 bg-[#142B24] text-xl font-black text-[#D3B879]">
              V
            </div>
            <span className="text-xl font-black tracking-[0.16em] sm:text-2xl">
              VEKİLX
            </span>
          </div>

          <div className="hidden w-full max-w-md md:block">
            <input
              placeholder="VEKİLX'te ara..."
              className="w-full rounded-full border border-[#B99A58]/20 bg-[#17231F] px-5 py-2.5 text-sm outline-none transition placeholder:text-[#A8ADA8]/60 focus:border-[#B99A58]"
            />
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {authLoading ? (
              <span className="text-sm text-[#A8ADA8]">Yükleniyor...</span>
            ) : userNickname ? (
              <>
                <span className="max-w-[130px] truncate rounded-xl border border-[#B99A58]/30 bg-[#142B24] px-3 py-2 text-xs font-bold text-[#D3B879] sm:max-w-[180px] sm:px-4 sm:text-sm">
                  @{userNickname}
                </span>

                <button
                  onClick={handleLogout}
                  disabled={signingOut}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-[#D8D8D0] transition hover:border-[#B99A58]/40 hover:bg-[#1C2A25] sm:px-4 sm:text-sm"
                >
                  {signingOut ? "Çıkılıyor..." : "Çıkış Yap"}
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-[#D8D8D0] transition hover:bg-[#1C2A25] sm:px-4 sm:text-sm"
                >
                  Giriş Yap
                </a>

                <a
                  href="/signup"
                  className="rounded-xl bg-[#B99A58] px-3 py-2 text-xs font-bold text-[#142B24] transition hover:bg-[#D3B879] sm:px-4 sm:text-sm"
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
            <p className="mb-4 px-3 text-xs font-bold tracking-[0.2em] text-[#A8ADA8]">
              VEKİLX MENÜSÜ
            </p>

            {navigation.map(([icon, label]) => (
              <button
                key={label}
                onClick={() => handleNavigation(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  active === label
                    ? "border border-[#B99A58]/20 bg-[#142B24] text-[#D3B879]"
                    : "text-[#A8ADA8] hover:bg-[#1C2A25] hover:text-[#F0EDE5]"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {label}
                {label === "Match" && (
                  <span className="ml-auto rounded-full border border-[#B99A58]/30 bg-[#B99A58]/10 px-2 py-0.5 text-xs text-[#D3B879]">
                    Yeni
                  </span>
                )}
              </button>
            ))}

            <div className="mt-8 rounded-2xl border border-[#B99A58]/20 bg-[#17231F] p-4">
              <p className="text-sm font-bold text-[#D3B879]">
                Söz vatandaşta.
              </p>
              <p className="mt-2 text-xs leading-5 text-[#A8ADA8]">
                Fikirlerinle katıl, düşüncelerinle iz bırak.
              </p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-[#B99A58]/30 bg-gradient-to-br from-[#1D3B30] via-[#142B24] to-[#101820] p-7 sm:p-10">
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#B99A58]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-[#1D3B30]/80 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-bold tracking-[0.3em] text-[#D3B879]">
                DİJİTAL CUMHURİYET'E HOŞ GELDİN
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                Siyaset ciddi,
                <br />
                <span className="text-[#D3B879]">biz değiliz.</span>
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-[#D8D8D0]">
                Fikrini söyle, insanlarla tanış, gündeme katıl.
                VEKİLX'te herkesin sözü var, herkesin bir hikâyesi.
              </p>

              <button
                onClick={() => router.push("/match")}
                className="mt-7 rounded-xl border border-[#D3B879]/50 bg-[#B99A58] px-6 py-3 text-sm font-bold text-[#142B24] transition hover:bg-[#D3B879]"
              >
                Vatandaşları keşfet →
              </button>
            </div>
          </div>

          {userId &&
            friendRequests.some(
              (request) =>
                request.receiver_id === userId && request.status === "pending"
            ) && (
              <div className="rounded-2xl border border-[#B99A58]/25 bg-[#17231F] p-5">
                <h2 className="mb-3 text-sm font-bold text-[#D3B879]">
                  Gelen arkadaşlık istekleri
                </h2>
                <div className="space-y-3">
                  {friendRequests
                    .filter(
                      (request) =>
                        request.receiver_id === userId &&
                        request.status === "pending"
                    )
                    .map((request) => (
                      <div
                        key={request.id}
                        className="flex flex-wrap items-center gap-3 rounded-xl bg-[#101820]/60 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {request.nickname || "Vatandaş"}
                          </p>
                          <p className="text-xs text-[#A8ADA8]">
                            Sana arkadaşlık isteği gönderdi.
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            handleFriendRequestResponse(request, "accepted")
                          }
                          disabled={friendRequestBusyId === String(request.id)}
                          className="rounded-lg bg-[#B99A58] px-3 py-2 text-xs font-bold text-[#142B24] disabled:opacity-50"
                        >
                          Kabul et
                        </button>
                        <button
                          onClick={() =>
                            handleFriendRequestResponse(request, "rejected")
                          }
                          disabled={friendRequestBusyId === String(request.id)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-[#A8ADA8] hover:bg-white/5 disabled:opacity-50"
                        >
                          Reddet
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">VEKİLX Gündemi</h2>
              <p className="mt-1 text-xs text-[#A8ADA8]">
                Sözün, fikrin ve gündemin buluşma noktası.
              </p>
            </div>

            <span className="rounded-full border border-[#B99A58]/30 bg-[#142B24] px-3 py-1 text-xs text-[#D3B879]">
              Canlı akış
            </span>
          </div>

          <div className="rounded-2xl border border-[#B99A58]/20 bg-[#17231F] p-4">
            <textarea
              value={post}
              onChange={(e) => setPost(e.target.value)}
              maxLength={1000}
              placeholder="Söz sende vatandaş. Aklından neler geçiyor?"
              className="min-h-24 w-full resize-none bg-transparent text-sm outline-none placeholder:text-[#A8ADA8]/50"
            />

            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <span className="text-xs text-[#A8ADA8]">
                {post.length}/1000 karakter
              </span>

              <button
                onClick={handlePost}
                disabled={posting || !post.trim()}
                className="rounded-lg bg-[#B99A58] px-4 py-2 text-xs font-bold text-[#142B24] transition hover:bg-[#D3B879] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {posting ? "Paylaşılıyor..." : "Yayınla"}
              </button>
            </div>
          </div>

          {message && (
            <p className="rounded-xl border border-[#B99A58]/20 bg-[#17231F] p-3 text-sm text-[#D3B879]">
              {message}
            </p>
          )}

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-[#17231F] p-6 text-center text-sm text-[#A8ADA8]">
              Gündem yükleniyor...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#17231F] p-8 text-center">
              <p className="font-bold">Henüz gündemde bir paylaşım yok.</p>
              <p className="mt-2 text-sm text-[#A8ADA8]">
                İlk sözü sen söyle.
              </p>
            </div>
          ) : (
            posts.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-white/10 bg-[#17231F] p-5 transition hover:border-[#B99A58]/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B99A58]/30 bg-[#142B24] font-bold text-[#D3B879]">
                    {item.nickname[0]?.toUpperCase() || "V"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{item.nickname}</p>
                    <p className="mt-1 text-xs text-[#A8ADA8]">
                      Vatandaş ·{" "}
                      {new Date(item.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  {userId && userId !== item.user_id && (
                    (() => {
                      const request = friendRequests.find(
                        (entry) =>
                          (entry.sender_id === userId &&
                            entry.receiver_id === item.user_id) ||
                          (entry.sender_id === item.user_id &&
                            entry.receiver_id === userId)
                      );

                      return (
                        <button
                          onClick={() => handleSendFriendRequest(item.user_id)}
                          disabled={
                            friendRequestBusyId === item.user_id ||
                            request?.status === "pending" ||
                            request?.status === "accepted"
                          }
                          className="rounded-lg border border-[#B99A58]/30 px-3 py-2 text-xs font-semibold text-[#D3B879] transition hover:bg-[#B99A58]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {request?.status === "accepted"
                            ? "Arkadaşsınız"
                            : request?.status === "pending"
                              ? request.sender_id === userId
                                ? "İstek gönderildi"
                                : "Sana istek gönderdi"
                              : friendRequestBusyId === item.user_id
                                ? "Gönderiliyor..."
                                : "Arkadaş ekle"}
                        </button>
                      );
                    })()
                  )}

                  {userId === item.user_id && (
                    <button
                      onClick={() => handleDeletePost(item.id)}
                      disabled={deletingPostId === item.id}
                      className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingPostId === item.id ? "Siliniyor..." : "Sil"}
                    </button>
                  )}

                  <span className="rounded-full border border-[#B99A58]/20 bg-[#142B24] px-3 py-1 text-[10px] font-bold tracking-wider text-[#D3B879]">
                    GÜNDEM
                  </span>
                </div>

                <p className="my-5 whitespace-pre-wrap break-words text-sm leading-7 text-[#E2E0D8]">
                  {item.content}
                </p>

                <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs text-[#A8ADA8]">
                  <button
                    onClick={() => handleLike(item.id)}
                    disabled={likingPostId !== null || !userId}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      item.liked_by_me
                        ? "bg-[#B99A58]/10 font-bold text-[#D3B879]"
                        : "hover:bg-[#1C2A25] hover:text-[#D3B879]"
                    }`}
                  >
                    <span className="text-base">
                      {item.liked_by_me ? "♥" : "♡"}
                    </span>
                    <span>
                      {likingPostId === item.id
                        ? "İşleniyor..."
                        : `Beğen ${item.likes_count > 0 ? `(${item.likes_count})` : ""}`}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleComments(item.id)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                      openComments.includes(item.id)
                        ? "bg-[#B99A58]/10 font-bold text-[#D3B879]"
                        : "hover:bg-[#1C2A25] hover:text-[#D3B879]"
                    }`}
                  >
                    <span>◯</span>
                    <span>
                      {openComments.includes(item.id)
                        ? "Yorumları gizle"
                        : "Yorumlar"}{" "}
                      ({item.comments_count})
                    </span>
                  </button>

                  <span className="ml-auto">VEKİLX</span>
                </div>

                {openComments.includes(item.id) && (
                  <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <h3 className="text-sm font-bold text-[#D3B879]">
                      Yorumlar ({item.comments_count})
                    </h3>

                    {(commentsByPost[item.id] || []).length === 0 ? (
                      <p className="rounded-xl bg-[#101820]/60 p-4 text-center text-xs text-[#A8ADA8]">
                        Henüz yorum yok. İlk yorumu sen yap!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {(commentsByPost[item.id] || []).map((comment) => (
                          <div
                            key={comment.id}
                            className="rounded-xl border border-white/5 bg-[#101820]/60 p-4"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#B99A58]/25 bg-[#142B24] text-xs font-bold text-[#D3B879]">
                                {comment.nickname[0]?.toUpperCase() || "V"}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-[#F0EDE5]">
                                  {comment.nickname}
                                </p>
                                <p className="text-[10px] text-[#A8ADA8]">
                                  {new Date(comment.created_at).toLocaleString(
                                    "tr-TR"
                                  )}
                                </p>
                              </div>

                              {userId === comment.user_id && (
                                <button
                                  onClick={() => handleDeleteComment(comment)}
                                  disabled={deletingCommentId === comment.id}
                                  className="rounded-lg px-2 py-1 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                >
                                  {deletingCommentId === comment.id
                                    ? "Siliniyor..."
                                    : "Sil"}
                                </button>
                              )}
                            </div>

                            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#D8D8D0]">
                              {comment.content}
                            </p>

                            <div className="mt-3 border-t border-white/5 pt-3">
                              {(repliesByComment[comment.id] || []).length > 0 && (
                                <div className="mb-3 space-y-2 pl-3">
                                  {(repliesByComment[comment.id] || []).map((reply) => (
                                    <div
                                      key={reply.id}
                                      className="rounded-lg border border-[#B99A58]/10 bg-[#17231F] p-3"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#B99A58]/20 bg-[#142B24] text-[10px] font-bold text-[#D3B879]">
                                          {reply.nickname[0]?.toUpperCase() || "V"}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-[11px] font-bold text-[#F0EDE5]">
                                            {reply.nickname}
                                          </p>
                                          <p className="text-[9px] text-[#A8ADA8]">
                                            {new Date(reply.created_at).toLocaleString("tr-TR")}
                                          </p>
                                        </div>
                                        {userId === reply.user_id && (
                                          <button
                                            onClick={() => handleDeleteReply(reply)}
                                            disabled={deletingReplyId === reply.id}
                                            className="px-2 py-1 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                          >
                                            {deletingReplyId === reply.id ? "Siliniyor..." : "Sil"}
                                          </button>
                                        )}
                                      </div>
                                      <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-[#D8D8D0]">
                                        {reply.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleReply(comment);
                                }}
                                className="pl-3"
                              >
                                <textarea
                                  value={replyDrafts[comment.id] || ""}
                                  onChange={(e) =>
                                    setReplyDrafts((previous) => ({
                                      ...previous,
                                      [comment.id]: e.target.value,
                                    }))
                                  }
                                  maxLength={1000}
                                  rows={1}
                                  placeholder={
                                    userId ? "Bu yoruma yanıt ver..." : "Yanıt vermek için giriş yap..."
                                  }
                                  className="w-full resize-y rounded-lg border border-white/5 bg-[#17231F] px-3 py-2 text-xs outline-none placeholder:text-[#A8ADA8]/50 focus:border-[#B99A58]/40"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[9px] text-[#A8ADA8]">
                                    {(replyDrafts[comment.id] || "").length}/1000
                                  </span>
                                  <button
                                    type="submit"
                                    disabled={
                                      replyingCommentId === comment.id ||
                                      !(replyDrafts[comment.id] || "").trim()
                                    }
                                    className="rounded-lg border border-[#B99A58]/30 px-3 py-1.5 text-[10px] font-bold text-[#D3B879] transition hover:bg-[#B99A58]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    {replyingCommentId === comment.id ? "Gönderiliyor..." : "Yanıtla"}
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleComment(item.id);
                      }}
                      className="rounded-xl border border-white/10 bg-[#101820] p-3"
                    >
                      <textarea
                        value={commentDrafts[item.id] || ""}
                        onChange={(e) =>
                          setCommentDrafts((previous) => ({
                            ...previous,
                            [item.id]: e.target.value,
                          }))
                        }
                        maxLength={1000}
                        rows={2}
                        placeholder={
                          userId
                            ? "Bu gönderiye yorum yap..."
                            : "Yorum yapmak için giriş yapmalısın..."
                        }
                        className="w-full resize-y bg-transparent text-sm outline-none placeholder:text-[#A8ADA8]/60"
                      />

                      <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
                        <span className="text-[10px] text-[#A8ADA8]">
                          {(commentDrafts[item.id] || "").length}/1000
                        </span>

                        <button
                          type="submit"
                          disabled={
                            commentingPostId === item.id ||
                            !(commentDrafts[item.id] || "").trim()
                          }
                          className="rounded-lg bg-[#B99A58] px-4 py-2 text-xs font-bold text-[#142B24] transition hover:bg-[#D3B879] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {commentingPostId === item.id
                            ? "Gönderiliyor..."
                            : "Yorum gönder"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </article>
            ))
          )}
        </section>

        <aside className="hidden space-y-5 lg:block">
          <div className="rounded-2xl border border-[#B99A58]/20 bg-[#17231F] p-5">
            <h3 className="font-bold text-[#D3B879]">VEKİLX'in Nabzı</h3>

            <div className="mt-5 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#A8ADA8]">Aktif vatandaş</span>
                <span className="font-bold">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A8ADA8]">Yeni eşleşmeler</span>
                <span className="font-bold">—</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A8ADA8]">Gündem başlıkları</span>
                <span className="font-bold">—</span>
              </div>
            </div>

            <p className="mt-5 text-[11px] leading-5 text-[#A8ADA8]/70">
              Canlı veriler geliştirilmeye devam ediyor.
            </p>
          </div>

          <div className="rounded-2xl border border-[#B99A58]/20 bg-[#17231F] p-5">
            <h3 className="font-bold text-[#D3B879]">Günün konusu</h3>
            <p className="mt-3 text-sm leading-6 text-[#E2E0D8]">
              VEKİLX'te güven mi daha önemli, güç mü?
            </p>
            <span className="mt-3 inline-block text-xs text-[#D3B879]">
              Yakında anketler
            </span>
          </div>

          <div className="px-2 text-[11px] leading-6 text-[#A8ADA8]/70">
            VEKİLX © 2026
            <br />
            Siyaset ciddi, biz değiliz.
          </div>
        </aside>
      </div>
    </main>
  );
}
