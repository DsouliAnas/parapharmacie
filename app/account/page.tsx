"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface ProfileForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ApiError {
  error?: string;
}

interface ApiSuccess {
  message?: string;
  error?: string;
}

export default function AccountPage() {
  const { data: session, status, update } = useSession();

  const [user, setUser] = useState<UserProfile | null>(null);

  const [profile, setProfile] = useState<ProfileForm>({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [password, setPassword] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingUser, setLoadingUser] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /*
   * Load the authenticated user's profile.
   *
   * Important:
   * We do NOT set loading state synchronously when status changes.
   * The authentication state itself is already provided by useSession().
   */
  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let cancelled = false;

    async function loadUser() {
      setLoadingUser(true);

      try {
        const response = await fetch("/api/user", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data: UserProfile | ApiError =
          await response.json();

        if (!response.ok) {
          throw new Error(
            "error" in data && data.error
              ? data.error
              : "Impossible de récupérer votre profil."
          );
        }

        if (cancelled) {
          return;
        }

        const profileData = data as UserProfile;

        setUser(profileData);

        setProfile({
          name: profileData.name || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          city: profileData.city || "",
          postalCode: profileData.postalCode || "",
        });
      } catch (error) {
        if (!cancelled) {
          console.error("LOAD PROFILE ERROR:", error);
        }
      } finally {
        if (!cancelled) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [status]);

  /*
   * Authentication is still loading.
   */
  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#7C8B73]/20 border-t-[#7C8B73]" />

          <p className="mt-4 text-sm text-gray-500">
            Chargement de votre compte...
          </p>
        </div>
      </main>
    );
  }

  /*
   * User is not authenticated.
   */
  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA] px-5">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Connexion requise
          </h1>

          <p className="mt-2 text-gray-500">
            Connectez-vous pour accéder à votre compte.
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-full bg-[#7C8B73] px-6 py-3 font-semibold text-white transition hover:bg-[#66745F]"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  /*
   * Authentication is confirmed, but the user profile
   * is still being fetched.
   */
  if (loadingUser || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F3EA]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#7C8B73]/20 border-t-[#7C8B73]" />

          <p className="mt-4 text-sm text-gray-500">
            Chargement de votre profil...
          </p>
        </div>
      </main>
    );
  }

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("") || "C";

  function handleProfileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handlePasswordChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const { name, value } = event.target;

    setPassword((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      const data: ApiSuccess = await response.json();

      if (!response.ok) {
        setProfileError(
          data.error ||
            "Impossible de mettre à jour le profil."
        );
        return;
      }

      setProfileMessage(
        data.message ||
          "Profil mis à jour avec succès."
      );

      setUser((current) =>
        current
          ? {
              ...current,
              name: profile.name,
              phone: profile.phone,
              address: profile.address,
              city: profile.city,
              postalCode: profile.postalCode,
            }
          : current
      );

      /*
       * Update the NextAuth session name.
       */
      await update({
        name: profile.name,
      });
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);

      setProfileError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      setPasswordError(
        "Veuillez remplir les trois champs."
      );
      return;
    }

    if (password.newPassword.length < 8) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    if (
      password.newPassword !==
      password.confirmPassword
    ) {
      setPasswordError(
        "Les nouveaux mots de passe ne correspondent pas."
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(password),
      });

      const data: ApiSuccess = await response.json();

      if (!response.ok) {
        setPasswordError(
          data.error ||
            "Impossible de changer le mot de passe."
        );
        return;
      }

      setPasswordMessage(
        data.message ||
          "Votre mot de passe a été modifié avec succès."
      );

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("CHANGE PASSWORD ERROR:", error);

      setPasswordError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F3EA] px-5 py-10 md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#7C8B73]">
            Mon espace
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#3F493A]">
            Mon compte
          </h1>

          <p className="mt-2 text-gray-600">
            Gérez vos informations personnelles et votre sécurité.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* MAIN */}
          <div className="space-y-6 lg:col-span-2">

            {/* PROFILE */}
            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

              <div className="flex flex-col items-center gap-5 border-b border-gray-100 pb-8 sm:flex-row">

                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[#7C8B73] text-2xl font-bold text-white">
                  {initials}
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user.name}
                  </h2>

                  <p className="mt-1 break-all text-gray-500">
                    {user.email}
                  </p>
                </div>

              </div>

              <form
                onSubmit={saveProfile}
                className="mt-8"
              >
                <h2 className="text-xl font-bold text-gray-900">
                  Informations personnelles
                </h2>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Nom
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={profile.name}
                      onChange={handleProfileChange}
                      required
                      maxLength={100}
                      autoComplete="name"
                      className="input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      disabled
                      className="input cursor-not-allowed bg-gray-100 text-gray-500"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      L&apos;adresse email ne peut pas être modifiée ici.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Téléphone
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="+216 XX XXX XXX"
                      maxLength={30}
                      autoComplete="tel"
                      className="input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Ville
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={profile.city}
                      onChange={handleProfileChange}
                      placeholder="Tunis"
                      maxLength={100}
                      autoComplete="address-level2"
                      className="input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Adresse
                    </label>

                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={profile.address}
                      onChange={handleProfileChange}
                      placeholder="Votre adresse"
                      maxLength={250}
                      autoComplete="street-address"
                      className="input"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Code postal
                    </label>

                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      value={profile.postalCode}
                      onChange={handleProfileChange}
                      placeholder="1000"
                      maxLength={20}
                      autoComplete="postal-code"
                      className="input"
                    />
                  </div>

                </div>

                {profileError && (
                  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {profileError}
                  </div>
                )}

                {profileMessage && (
                  <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    {profileMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="mt-6 rounded-full bg-[#7C8B73] px-7 py-3 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile
                    ? "Enregistrement..."
                    : "Enregistrer les modifications"}
                </button>

              </form>
            </section>

            {/* PASSWORD */}
            <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Sécurité
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Modifiez votre mot de passe pour sécuriser votre compte.
                </p>
              </div>

              <form
                onSubmit={changePassword}
                className="mt-6 space-y-5"
              >

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Mot de passe actuel
                  </label>

                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={password.currentPassword}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Nouveau mot de passe
                  </label>

                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={password.newPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
                    className="input"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Minimum 8 caractères.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Confirmer le nouveau mot de passe
                  </label>

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={password.confirmPassword}
                    onChange={handlePasswordChange}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    required
                    className="input"
                  />
                </div>

                {passwordError && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {passwordError}
                  </div>
                )}

                {passwordMessage && (
                  <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    {passwordMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-full bg-[#3F493A] px-7 py-3 font-semibold text-white transition hover:bg-[#30382C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword
                    ? "Modification..."
                    : "Changer le mot de passe"}
                </button>

              </form>
            </section>
          </div>

          {/* SIDEBAR */}
          <aside className="space-y-4">

            <h2 className="text-xl font-bold text-[#3F493A]">
              Mon espace
            </h2>

            <Link
              href="/orders"
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C8B73]/10 text-xl">
                📦
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Mes commandes
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Historique et détails
                </p>
              </div>

              <span className="text-[#7C8B73] transition group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C8B73]/10 text-xl">
                ♡
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Ma wishlist
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Mes produits favoris
                </p>
              </div>

              <span className="text-[#7C8B73] transition group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/shop"
              className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7C8B73]/10 text-xl">
                🛍️
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  Boutique
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Découvrir les produits
                </p>
              </div>

              <span className="text-[#7C8B73] transition group-hover:translate-x-1">
                →
              </span>
            </Link>

          </aside>
        </div>
      </div>
    </main>
  );
}