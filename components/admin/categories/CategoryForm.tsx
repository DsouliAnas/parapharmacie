"use client";

import { useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";

interface CategoryFormProps {
  onSuccess: () => void;
}

interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  image?: string;
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

function getApiError(
  data: unknown,
  fallback: string
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "string"
  ) {
    return data.error;
  }

  return fallback;
}

function isCategoryResponse(
  data: unknown
): data is CategoryResponse {
  if (
    typeof data !== "object" ||
    data === null
  ) {
    return false;
  }

  if (!("_id" in data)) {
    return false;
  }

  if (!("name" in data)) {
    return false;
  }

  if (!("slug" in data)) {
    return false;
  }

  return (
    typeof data._id === "string" &&
    typeof data.name === "string" &&
    typeof data.slug === "string"
  );
}

export default function CategoryForm({
  onSuccess,
}: CategoryFormProps) {
  const [name, setName] =
    useState<string>("");

  const [image, setImage] =
    useState<string>("");

  const [subcategories, setSubcategories] =
    useState<string[]>([]);

  const [newSubcategory, setNewSubcategory] =
    useState<string>("");

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  function addSubcategory(): void {
    const trimmedName =
      newSubcategory.trim();

    if (!trimmedName) {
      return;
    }

    const alreadyExists =
      subcategories.some(
        (subcategory) =>
          subcategory.toLowerCase() ===
          trimmedName.toLowerCase()
      );

    if (alreadyExists) {
      setError(
        "Cette sous-catégorie existe déjà."
      );
      return;
    }

    setSubcategories(
      (previous) => [
        ...previous,
        trimmedName,
      ]
    );

    setNewSubcategory("");
    setError("");
  }

  function removeSubcategory(
    index: number
  ): void {
    setSubcategories(
      (previous) =>
        previous.filter(
          (_, currentIndex) =>
            currentIndex !== index
        )
    );
  }

  function handleSubcategoryKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ): void {
    if (event.key === "Enter") {
      event.preventDefault();
      addSubcategory();
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();

    setError("");

    const trimmedName =
      name.trim();

    if (!trimmedName) {
      setError(
        "Veuillez entrer le nom de la catégorie."
      );
      return;
    }

    if (!image) {
      setError(
        "Veuillez ajouter une image pour la catégorie."
      );
      return;
    }

    /*
     * If the user typed a subcategory but
     * didn't click "+ Ajouter", add it automatically.
     */
    const pendingSubcategory =
      newSubcategory.trim();

    const finalSubcategories =
      pendingSubcategory &&
      !subcategories.some(
        (subcategory) =>
          subcategory.toLowerCase() ===
          pendingSubcategory.toLowerCase()
      )
        ? [
            ...subcategories,
            pendingSubcategory,
          ]
        : subcategories;

    const categorySlug =
      createSlug(trimmedName);

    if (!categorySlug) {
      setError(
        "Le nom de la catégorie ne permet pas de créer un slug valide."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * ==========================================
       * 1. CREATE CATEGORY
       * ==========================================
       */

      const categoryResponse =
        await fetch(
          "/api/categories",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name: trimmedName,
              slug: categorySlug,
              image,
            }),
          }
        );

      const categoryData: unknown =
        await categoryResponse.json();

      if (!categoryResponse.ok) {
        throw new Error(
          getApiError(
            categoryData,
            "Erreur lors de la création de la catégorie."
          )
        );
      }

      /*
       * Make sure the API actually returned
       * a valid category.
       */

      if (
        !isCategoryResponse(
          categoryData
        )
      ) {
        throw new Error(
          "La réponse de création de la catégorie est invalide."
        );
      }

      const categoryId =
        categoryData._id;

      /*
       * ==========================================
       * 2. CREATE SUBCATEGORIES
       * ==========================================
       */

      for (
        const subcategoryName
        of finalSubcategories
      ) {
        const subcategorySlug =
          createSlug(
            subcategoryName
          );

        if (!subcategorySlug) {
          continue;
        }

        const subcategoryResponse =
          await fetch(
            "/api/subcategories",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                name: subcategoryName,
                slug: subcategorySlug,
                category: categoryId,
              }),
            }
          );

        const subcategoryData: unknown =
          await subcategoryResponse.json();

        if (
          !subcategoryResponse.ok
        ) {
          throw new Error(
            getApiError(
              subcategoryData,
              `Erreur lors de la création de la sous-catégorie "${subcategoryName}".`
            )
          );
        }
      }

      /*
       * ==========================================
       * 3. RESET
       * ==========================================
       */

      setName("");
      setImage("");
      setSubcategories([]);
      setNewSubcategory("");
      setError("");

      /*
       * ==========================================
       * 4. SUCCESS
       * ==========================================
       */

      onSuccess();
    } catch (error: unknown) {
      console.error(
        "CREATE CATEGORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* ==========================================
          CATEGORY NAME
          ========================================== */}

      <div className="space-y-2">
        <label
          htmlFor="category-name"
          className="block text-sm font-semibold text-gray-700"
        >
          Nom de la catégorie
        </label>

        <input
          id="category-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(
              event.target.value
            )
          }
          placeholder="Ex: Visage"
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
            Slug :{" "}
            <span className="font-medium text-gray-500">
              {createSlug(name)}
            </span>
          </p>
        )}
      </div>

      {/* ==========================================
          CATEGORY IMAGE
          ========================================== */}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">
          Image de la catégorie
        </p>

        <CloudinaryUpload
          onUpload={(url: string) => {
            setImage(url);
            setError("");
          }}
          buttonText={
            image
              ? "Changer l'image"
              : "Télécharger une image"
          }
        />

        {image && (
          <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50/80 p-4">
            <img
              src={image}
              alt="Aperçu de la catégorie"
              className="
                h-16
                w-16
                rounded-xl
                object-cover
                shadow-sm
                ring-1
                ring-green-100
              "
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-green-700">
                Image téléchargée
              </p>

              <button
                type="button"
                onClick={() =>
                  setImage("")
                }
                className="
                  mt-1
                  text-xs
                  font-medium
                  text-red-500
                  transition
                  hover:text-red-600
                "
              >
                Supprimer l&apos;image
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          SUBCATEGORIES
          ========================================== */}

      <div className="space-y-3">
        <div>
          <label
            htmlFor="subcategory-name"
            className="block text-sm font-semibold text-gray-700"
          >
            Sous-catégories
          </label>

          <p className="mt-1 text-xs text-gray-500">
            Ajoutez les sous-catégories de cette
            catégorie.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            id="subcategory-name"
            type="text"
            value={newSubcategory}
            onChange={(event) =>
              setNewSubcategory(
                event.target.value
              )
            }
            onKeyDown={
              handleSubcategoryKeyDown
            }
            placeholder="Ex: Nettoyants"
            className="
              min-w-0
              flex-1
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
          />

          <button
            type="button"
            onClick={
              addSubcategory
            }
            className="
              shrink-0
              rounded-2xl
              bg-[#7C8B73]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#66745F]
              active:scale-[0.98]
            "
          >
            + Ajouter
          </button>
        </div>

        {subcategories.length > 0 && (
          <div className="space-y-2 rounded-2xl bg-[#F8F3EA] p-4">
            {subcategories.map(
              (
                subcategory,
                index
              ) => (
                <div
                  key={`${subcategory}-${index}`}
                  className="
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    bg-white
                    px-4
                    py-3
                    shadow-sm
                    ring-1
                    ring-gray-100
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[#7C8B73]
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {subcategory}
                      </p>

                      <p className="text-xs text-gray-400">
                        /{createSlug(
                          subcategory
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeSubcategory(
                        index
                      )
                    }
                    className="
                      ml-3
                      shrink-0
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-medium
                      text-red-500
                      transition
                      hover:bg-red-50
                      hover:text-red-600
                    "
                  >
                    Supprimer
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {newSubcategory.trim() && (
          <p className="text-xs text-gray-400">
            Cette sous-catégorie sera ajoutée lors
            de la création :{" "}
            <span className="font-medium text-gray-600">
              {newSubcategory.trim()}
            </span>
          </p>
        )}
      </div>

      {/* ==========================================
          ERROR
          ========================================== */}

      {error && (
        <div
          className="
            rounded-2xl
            border
            border-red-100
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
          "
        >
          {error}
        </div>
      )}

      {/* ==========================================
          SUBMIT
          ========================================== */}

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
          ? "Création en cours..."
          : "Créer la catégorie"}
      </button>
    </form>
  );
}