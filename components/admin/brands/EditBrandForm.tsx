"use client";

import { useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface EditBrandFormProps {
  brand: Brand;
  onSuccess: () => void;
}

interface ErrorResponse {
  error?: string;
}

export default function EditBrandForm({
  brand,
  onSuccess,
}: EditBrandFormProps): React.ReactElement {
  const [name, setName] = useState<string>(brand.name);
  const [logo, setLogo] = useState<string>(brand.logo ?? "");
  const [loading, setLoading] = useState<boolean>(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Veuillez saisir le nom de la marque.");
      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/brands/${brand._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          logo,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        const errorData = data as ErrorResponse;

        alert(
          errorData.error ??
            "Erreur lors de la modification de la marque."
        );

        return;
      }

      onSuccess();
    } catch (error: unknown) {
      console.error("UPDATE BRAND ERROR:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="edit-brand-name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Nom de la marque
        </label>

        <input
          id="edit-brand-name"
          name="name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nom de la marque"
          className="w-full rounded-xl border border-gray-200 p-3 outline-none transition focus:border-[#7C8B73] focus:ring-2 focus:ring-[#7C8B73]/20"
          required
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Logo de la marque
        </p>

        <CloudinaryUpload
          onUpload={(url: string) => setLogo(url)}
          buttonText={
            logo ? "Changer le logo" : "Télécharger un logo"
          }
        />

        {logo && (
          <img
            src={logo}
            alt={name || "Logo de la marque"}
            className="h-24 w-24 rounded-lg border object-contain"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#7C8B73] px-6 py-3 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Modification..." : "Modifier"}
      </button>
    </form>
  );
}