"use client";

import { useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface EditCategoryFormProps {
  category: Category;
  onSuccess: () => void;
}

interface UpdateCategoryResponse {
  error?: string;
}

function createSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EditCategoryForm({
  category,
  onSuccess,
}: EditCategoryFormProps) {
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState(category.image || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    if (!name.trim()) {
      alert("Veuillez entrer un nom de catégorie.");
      return;
    }

    if (!image) {
      alert("Veuillez ajouter une image.");
      return;
    }

    const slug = createSlug(name);

    try {
      setLoading(true);

      const response = await fetch(
        `/api/categories/${category._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug,
            image,
          }),
        }
      );

      const data: UpdateCategoryResponse =
        await response.json();

      if (!response.ok) {
        alert(
          data.error || "Erreur lors de la modification."
        );
        return;
      }

      onSuccess();
    } catch (error) {
      console.error("UPDATE CATEGORY FORM ERROR:", error);

      alert(
        "Une erreur est survenue lors de la modification."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Nom de la catégorie
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la catégorie"
          className="
            w-full
            rounded-2xl
            border
            border-gray-200
            bg-gray-50/50
            px-4
            py-3
            text-sm
            text-gray-900
            outline-none
            transition
            placeholder:text-gray-400
            focus:border-[#7C8B73]
            focus:bg-white
            focus:ring-2
            focus:ring-[#7C8B73]/15
          "
          required
        />

        {name.trim() && (
          <p className="text-xs text-gray-400">
            Slug:{" "}
            <span className="font-medium text-gray-500">
              {createSlug(name)}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Image de la catégorie
        </label>

        <CloudinaryUpload
          onUpload={(url: string) => setImage(url)}
          buttonText={
            image
              ? "Changer l'image"
              : "Télécharger une image"
          }
        />

        {image && (
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <img
              src={image}
              alt={name}
              className="h-40 w-full object-cover sm:h-48"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-2xl
          bg-[#7C8B73]
          px-6
          py-3.5
          text-sm
          font-semibold
          text-white
          shadow-sm
          transition
          hover:bg-[#66745F]
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Sauvegarde en cours..."
          : "Sauvegarder les modifications"}
      </button>
    </form>
  );
}