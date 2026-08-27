"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error();
      }

      window.alert("Votre message a été envoyé.");

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      });
    } catch {
      window.alert("Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  const inputClassName =
    "w-full border border-[var(--line-dark)] bg-transparent px-4 py-3 text-sm text-[var(--paper)] outline-none transition-all duration-200 placeholder:text-[var(--paper)]/35 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/30";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* First name + Last name */}
      <div className="grid gap-5 md:grid-cols-2">
        <input
          type="text"
          value={form.firstName}
          onChange={(e) =>
            setForm({
              ...form,
              firstName: e.target.value,
            })
          }
          placeholder="Prénom"
          required
          className={inputClassName}
        />

        <input
          type="text"
          value={form.lastName}
          onChange={(e) =>
            setForm({
              ...form,
              lastName: e.target.value,
            })
          }
          placeholder="Nom"
          required
          className={inputClassName}
        />
      </div>

      {/* Email */}
      <input
        type="email"
        value={form.email}
        onChange={(e) =>
          setForm({
            ...form,
            email: e.target.value,
          })
        }
        placeholder="Email"
        required
        className={inputClassName}
      />

      {/* Message */}
      <textarea
        rows={6}
        value={form.message}
        onChange={(e) =>
          setForm({
            ...form,
            message: e.target.value,
          })
        }
        placeholder="Votre message..."
        required
        className={`${inputClassName} resize-none`}
      />

      {/* Submit */}
      <button
        disabled={loading}
        type="submit"
        className="inline-flex items-center justify-center gap-2 bg-[var(--gold)] px-6 py-3 text-sm font-semibold text-[var(--forest)] transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Envoyer"}

        <Send
          size={16}
          strokeWidth={2}
        />
      </button>
    </form>
  );
}