"use client";

import { FormEvent, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function login(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");

    if (loading) return;

    if (!email.trim() || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError("Email ou mot de passe incorrect");
        return;
      }

      const session = await getSession();

      if (session?.user?.role === "admin") {
        router.replace("/admin");
        return;
      }

      router.replace("/");
    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-72px)] overflow-hidden bg-[#F8F3EA]">
      {/* Soft ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#7C8B73]/15 blur-[100px]" />
        <div className="absolute -right-32 top-1/3 h-[380px] w-[380px] rounded-full bg-[#C9B8A0]/20 blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-[#A8B89A]/15 blur-[90px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col lg:flex-row">
        {/* Left brand panel */}
        <div className="relative hidden flex-1 flex-col justify-between p-12 lg:flex xl:p-16">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-[#7C8B73]/20 bg-white/50 px-4 py-2 backdrop-blur-sm">
              <span className="text-lg">🧚</span>
              <span className="text-sm font-medium tracking-wide text-[#3F493A]">
                Fairy&apos;s
              </span>
            </div>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-[#3F493A] xl:text-5xl">
              Entrez dans un univers
              <span className="mt-2 block bg-gradient-to-r from-[#7C8B73] to-[#5A6B52] bg-clip-text text-transparent">
                doux & magique
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Retrouvez vos commandes, vos favoris et une expérience pensée avec
              soin, juste pour vous.
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex -space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#7C8B73]/20 text-xs">
                ✨
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#C9B8A0]/30 text-xs">
                🌿
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#A8B89A]/25 text-xs">
                🍃
              </div>
            </div>
            <span>Des milliers de clients enchantés</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            {/* Mobile logo */}
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#7C8B73]/20 bg-white/70 px-4 py-2 backdrop-blur-sm">
                <span className="text-lg">🧚</span>
                <span className="text-sm font-semibold text-[#3F493A]">
                  Fairy&apos;s
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/75 p-8 shadow-[0_25px_50px_-12px_rgba(124,139,115,0.15)] backdrop-blur-xl sm:p-10">
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Content de vous revoir
                </h1>
                <p className="mt-2 text-[15px] text-gray-500">
                  Connectez-vous pour continuer votre expérience
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3.5 text-sm text-red-700">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={login} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-[13px] font-medium text-gray-700"
                  >
                    Adresse email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <svg
                        className="h-[18px] w-[18px]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      className="w-full rounded-2xl border border-gray-200/80 bg-white/90 py-3.5 pl-12 pr-4 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-[13px] font-medium text-gray-700"
                    >
                      Mot de passe
                    </label>
                    <Link
                      href="#"
                      className="text-[13px] font-medium text-[#7C8B73] transition hover:text-[#5A6B52]"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <svg
                        className="h-[18px] w-[18px]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError("");
                      }}
                      className="w-full rounded-2xl border border-gray-200/80 bg-white/90 py-3.5 pl-12 pr-12 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-[#7C8B73]"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#7C8B73] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#7C8B73]/25 transition hover:bg-[#6B7A63] hover:shadow-xl hover:shadow-[#7C8B73]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg
                        className="h-5 w-5 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Connexion...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <svg
                        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200/80" />
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  ou
                </span>
                <div className="h-px flex-1 bg-gray-200/80" />
              </div>

              {/* Register */}
              <p className="text-center text-[15px] text-gray-500">
                Pas encore de compte ?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#7C8B73] transition hover:text-[#5A6B52]"
                >
                  Créer un compte
                </Link>
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
              En vous connectant, vous acceptez nos conditions d&apos;utilisation
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}