"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface RegisterResponse {
  error?: string;
}

const initialForm: RegisterForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  }

  async function register(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (loading) return;

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
        }),
      });

      let data: RegisterResponse = {};
      try {
        data = (await response.json()) as RegisterResponse;
      } catch {
        data = {};
      }

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création du compte.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      console.error("REGISTER ERROR:", err);
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
              Rejoignez l&apos;univers
              <span className="mt-2 block bg-gradient-to-r from-[#7C8B73] to-[#5A6B52] bg-clip-text text-transparent">
                Fairy&apos;s
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Créez votre compte en quelques secondes et profitez d&apos;une
              expérience douce, soignée et pensée pour vous.
            </p>

            <ul className="mt-8 space-y-3 text-[15px] text-gray-600">
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C8B73]/15 text-xs text-[#7C8B73]">
                  ✓
                </span>
                Suivi de commandes en temps réel
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C8B73]/15 text-xs text-[#7C8B73]">
                  ✓
                </span>
                Adresse de livraison sauvegardée
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7C8B73]/15 text-xs text-[#7C8B73]">
                  ✓
                </span>
                Expérience personnalisée
              </li>
            </ul>
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
            <span>Rejoignez la communauté Fairy&apos;s</span>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[460px]">
            {/* Mobile logo */}
            <div className="mb-7 flex justify-center lg:hidden">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#7C8B73]/20 bg-white/70 px-4 py-2 backdrop-blur-sm">
                <span className="text-lg">🧚</span>
                <span className="text-sm font-semibold text-[#3F493A]">
                  Fairy&apos;s
                </span>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/75 p-7 shadow-[0_25px_50px_-12px_rgba(124,139,115,0.15)] backdrop-blur-xl sm:p-9">
              <div className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-[28px]">
                  Créer un compte
                </h1>
                <p className="mt-2 text-[15px] text-gray-500">
                  Remplissez les informations ci-dessous
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3.5 text-sm text-red-700">
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

              {/* Success */}
              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-green-100 bg-green-50/80 px-4 py-3.5 text-sm text-green-700">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Compte créé avec succès ! Redirection...</span>
                </div>
              )}

              <form onSubmit={register} className="space-y-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-[13px] font-medium text-gray-700"
                  >
                    Nom complet <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[13px] font-medium text-gray-700"
                  >
                    Adresse email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                  />
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-[13px] font-medium text-gray-700"
                  >
                    Mot de passe <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Minimum 8 caractères"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full rounded-2xl border border-gray-200/80 bg-white/90 py-3 pl-4 pr-12 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
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

                {/* Optional delivery section */}
                <div className="pt-2">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gray-200/80" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Livraison (optionnel)
                    </span>
                    <div className="h-px flex-1 bg-gray-200/80" />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-1.5 block text-[13px] font-medium text-gray-700"
                      >
                        Téléphone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="Votre numéro"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="mb-1.5 block text-[13px] font-medium text-gray-700"
                      >
                        Adresse
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        autoComplete="street-address"
                        placeholder="Rue, numéro..."
                        value={form.address}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="city"
                          className="mb-1.5 block text-[13px] font-medium text-gray-700"
                        >
                          Ville
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          autoComplete="address-level2"
                          placeholder="Ville"
                          value={form.city}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="postalCode"
                          className="mb-1.5 block text-[13px] font-medium text-gray-700"
                        >
                          Code postal
                        </label>
                        <input
                          id="postalCode"
                          name="postalCode"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          placeholder="Code"
                          value={form.postalCode}
                          onChange={handleChange}
                          className="w-full rounded-2xl border border-gray-200/80 bg-white/90 px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7C8B73] focus:ring-[3px] focus:ring-[#7C8B73]/15"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#7C8B73] py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-[#7C8B73]/25 transition hover:bg-[#6B7A63] hover:shadow-xl hover:shadow-[#7C8B73]/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
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
                      Création en cours...
                    </>
                  ) : success ? (
                    "Compte créé ✓"
                  ) : (
                    <>
                      Créer mon compte
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

              {/* Login link */}
              <p className="mt-7 text-center text-[15px] text-gray-500">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#7C8B73] transition hover:text-[#5A6B52]"
                >
                  Se connecter
                </Link>
              </p>
            </div>

            <p className="mt-7 text-center text-xs text-gray-400">
              En créant un compte, vous acceptez nos conditions d&apos;utilisation
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}