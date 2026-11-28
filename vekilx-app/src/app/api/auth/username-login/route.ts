
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    if (
      typeof login !== "string" ||
      typeof password !== "string" ||
      !login.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Kullanıcı adı/e-posta ve şifre gerekli." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !publishableKey || !secretKey) {
      return NextResponse.json(
        { error: "Sunucu yapılandırması eksik." },
        { status: 500 }
      );
    }

    const admin = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const anon = createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const identifier = login.trim();
    let email = identifier;

    if (!identifier.includes("@")) {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(identifier)) {
        return NextResponse.json(
          { error: "Kullanıcı adı veya şifre hatalı." },
          { status: 401 }
        );
      }

      const { data: profile, error: profileError } = await admin
        .from("profiles")
        .select("id")
        .ilike("nickname", identifier)
        .maybeSingle();

      if (profileError || !profile) {
        return NextResponse.json(
          { error: "Kullanıcı adı veya şifre hatalı." },
          { status: 401 }
        );
      }

      const { data: userData, error: userError } =
        await admin.auth.admin.getUserById(profile.id);

      if (userError || !userData.user?.email) {
        return NextResponse.json(
          { error: "Kullanıcı adı veya şifre hatalı." },
          { status: 401 }
        );
      }

      email = userData.user.email;
    }

    const { data, error } = await anon.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: "Kullanıcı adı/e-posta veya şifre hatalı." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Giriş sırasında beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}
