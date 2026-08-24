"use client";

import { FormEvent, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface SubcategoryFormProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSuccess: () => void;
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function SubcategoryForm({
  categories,
  selectedCategoryId = "",
  onSuccess,
}: SubcategoryFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] =
    useState(selectedCategoryId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const cleanName = name.trim();
    const slug = createSlug(cleanName);

    if (!cleanName) {
      setError(
        "Le nom de la sous-catégorie est obligatoire."
      );
      return;
    }

    if (!category) {
      setError("Veuillez choisir une catégorie.");
      return;
    }

    if (!slug) {
      setError(
        "Impossible de créer un slug pour cette sous-catégorie."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/subcategories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: cleanName,
            slug,
            category,
          }),
        }
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de créer la sous-catégorie."
        );
        return;
      }

      setName("");

      if (!selectedCategoryId) {
        setCategory("");
      }

      onSuccess();
    } catch (error) {
      console.error(
        "CREATE SUBCATEGORY ERROR:",
        error
      );

      setError(
        "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="subcategory-name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Nom de la sous-catégorie
        </label>

        <input
          id="subcategory-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          placeholder="Ex: Couches"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#7C8B73] focus:ring-2 focus:ring-[#7C8B73]/10"
          disabled={loading}
        />
      </div>

      {!selectedCategoryId && (
        <div>
          <label
            htmlFor="subcategory-category"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Catégorie principale
          </label>

          <select
            id="subcategory-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none transition focus:border-[#7C8B73] focus:ring-2 focus:ring-[#7C8B73]/10"
            disabled={loading}
          >
            <option value="">
              Sélectionner une catégorie
            </option>

            {categories.map((item) => (
              <option
                key={item._id}
                value={item._id}
              >
                {item.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCategoryId && (
        <div className="rounded-xl bg-[#F8F3EA] p-4 text-sm text-gray-600">
          Cette sous-catégorie sera ajoutée à la
          catégorie sélectionnée.
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#7C8B73] px-5 py-3 font-semibold text-white transition hover:bg-[#66745F] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Ajout..."
          : "Ajouter la sous-catégorie"}
      </button>
    </form>
  );
}