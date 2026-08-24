"use client";

import {
  FormEvent,
  useState,
} from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError(
        "Veuillez remplir tous les champs."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(
        "credentials",
        {
          email: normalizedEmail,
          password,
          redirect: false,
        }
      );

      /*
       * Always use the same message.
       *
       * Do not tell the attacker whether:
       * - the email exists
       * - the password was wrong
       * - the account is not an admin
       */
      if (
        !result ||
        result.error ||
        !result.ok
      ) {
        setError(
          "Email ou mot de passe incorrect."
        );
        setLoading(false);
        return;
      }

      /*
       * Authentication succeeded.
       *
       * The actual admin authorization must also
       * be enforced by middleware/server-side routes.
       */
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      /*
       * Never log the password or credentials.
       */
      console.error(
        "ADMIN LOGIN ERROR:",
        error instanceof Error
          ? error.message
          : "Unknown error"
      );

      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );

      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#7C8B73]">
            Fairy&apos;s
          </h1>

          <p className="mt-2 text-gray-500">
            Administration
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="admin-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@fairys.tn"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={loading}
              required
              maxLength={254}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-[#7C8B73] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>

            <input
              id="admin-password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              required
              maxLength={128}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none transition focus:border-[#7C8B73] disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !email.trim() ||
              !password
            }
            className="w-full rounded-full bg-[#7C8B73] px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>
        </form>
      </div>
    </main>
  );
}