"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import CategoryForm from "@/components/admin/categories/CategoryForm";
import EditCategoryForm from "@/components/admin/categories/EditCategoryForm";

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface Subcategory {
  _id: string;
  name: string;
  category: string;
}

interface CategoryManagerProps {
  categories: Category[];
}

interface SubcategoryResponse {
  _id: string;
  name: string;
  category:
    | string
    | {
        _id: string;
      };
}

export default function CategoryManager({
  categories,
}: CategoryManagerProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  const [subcategories, setSubcategories] =
    useState<Subcategory[]>([]);

  const [loadingSubcategories, setLoadingSubcategories] =
    useState(false);

  const [subcategoryName, setSubcategoryName] =
    useState("");

  const [addingSubcategory, setAddingSubcategory] =
    useState(false);

  const [editingSubcategoryId, setEditingSubcategoryId] =
    useState<string | null>(null);

  const [editingSubcategoryName, setEditingSubcategoryName] =
    useState("");

  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | DELETE CATEGORY
  |--------------------------------------------------------------------------
  */

  async function deleteCategory(
    id: string
  ): Promise<void> {
    const confirmDelete =
      window.confirm(
        "Supprimer cette catégorie ?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/categories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        window.alert(
          data.error ||
            "Impossible de supprimer la catégorie."
        );

        return;
      }

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE CATEGORY ERROR:",
        error
      );

      window.alert(
        "Une erreur est survenue lors de la suppression."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | LOAD SUBCATEGORIES
  |--------------------------------------------------------------------------
  */

  async function loadSubcategories(
    categoryId: string
  ): Promise<void> {
    setLoadingSubcategories(true);
    setError("");

    try {
      const response = await fetch(
        `/api/subcategories?category=${categoryId}`,
        {
          cache: "no-store",
        }
      );

      const data =
        (await response.json()) as
          | SubcategoryResponse[]
          | {
              error?: string;
            };

      if (!response.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : "Impossible de charger les sous-catégories."
        );

        return;
      }

      if (!Array.isArray(data)) {
        setError(
          "Réponse invalide du serveur."
        );

        return;
      }

      const formattedSubcategories =
        data.map((item) => ({
          _id: item._id,
          name: item.name,
          category:
            typeof item.category ===
            "string"
              ? item.category
              : item.category._id,
        }));

      setSubcategories(
        formattedSubcategories
      );
    } catch (error) {
      console.error(
        "LOAD SUBCATEGORIES ERROR:",
        error
      );

      setError(
        "Impossible de charger les sous-catégories."
      );
    } finally {
      setLoadingSubcategories(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | OPEN CATEGORY EDIT
  |--------------------------------------------------------------------------
  */

  async function openEditCategory(
    category: Category
  ): Promise<void> {
    setSelectedCategory(category);
    setEditOpen(true);
    setSubcategories([]);
    setError("");

    await loadSubcategories(
      category._id
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ADD SUBCATEGORY
  |--------------------------------------------------------------------------
  */

  async function addSubcategory(): Promise<void> {
    if (!selectedCategory) {
      return;
    }

    const name =
      subcategoryName.trim();

    if (!name) {
      setError(
        "Veuillez entrer un nom."
      );

      return;
    }

    setAddingSubcategory(true);
    setError("");

    try {
      const response = await fetch(
        "/api/subcategories",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
            category:
              selectedCategory._id,
          }),
        }
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible d'ajouter la sous-catégorie."
        );

        return;
      }

      setSubcategoryName("");

      await loadSubcategories(
        selectedCategory._id
      );

      router.refresh();
    } catch (error) {
      console.error(
        "ADD SUBCATEGORY ERROR:",
        error
      );

      setError(
        "Une erreur est survenue."
      );
    } finally {
      setAddingSubcategory(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | DELETE SUBCATEGORY
  |--------------------------------------------------------------------------
  */

  async function deleteSubcategory(
    id: string
  ): Promise<void> {
    const confirmDelete =
      window.confirm(
        "Supprimer cette sous-catégorie ?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/subcategories/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de supprimer la sous-catégorie."
        );

        return;
      }

      if (selectedCategory) {
        await loadSubcategories(
          selectedCategory._id
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE SUBCATEGORY ERROR:",
        error
      );

      setError(
        "Une erreur est survenue."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | START EDIT SUBCATEGORY
  |--------------------------------------------------------------------------
  */

  function startEditSubcategory(
    subcategory: Subcategory
  ): void {
    setEditingSubcategoryId(
      subcategory._id
    );

    setEditingSubcategoryName(
      subcategory.name
    );

    setError("");
  }

  /*
  |--------------------------------------------------------------------------
  | CANCEL EDIT SUBCATEGORY
  |--------------------------------------------------------------------------
  */

  function cancelEditSubcategory(): void {
    setEditingSubcategoryId(
      null
    );

    setEditingSubcategoryName("");
  }

  /*
  |--------------------------------------------------------------------------
  | UPDATE SUBCATEGORY
  |--------------------------------------------------------------------------
  */

  async function updateSubcategory(): Promise<void> {
    if (
      !editingSubcategoryId ||
      !selectedCategory
    ) {
      return;
    }

    const name =
      editingSubcategoryName.trim();

    if (!name) {
      setError(
        "Le nom ne peut pas être vide."
      );

      return;
    }

    setError("");

    try {
      const response = await fetch(
        `/api/subcategories/${editingSubcategoryId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const data = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de modifier la sous-catégorie."
        );

        return;
      }

      cancelEditSubcategory();

      await loadSubcategories(
        selectedCategory._id
      );

      router.refresh();
    } catch (error) {
      console.error(
        "UPDATE SUBCATEGORY ERROR:",
        error
      );

      setError(
        "Une erreur est survenue."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CLOSE EDIT
  |--------------------------------------------------------------------------
  */

  function closeEdit(): void {
    setEditOpen(false);
    setSelectedCategory(null);
    setSubcategories([]);
    setSubcategoryName("");
    setEditingSubcategoryId(null);
    setEditingSubcategoryName("");
    setError("");
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#7C8B73] sm:text-4xl">
            Gestion des catégories
          </h1>

          <p className="mt-2 text-gray-500">
            Créez, modifiez et organisez les
            catégories de vos produits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            inline-flex
            items-center
            justify-center
            rounded-full
            bg-[#7C8B73]
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-[#66745F]
          "
        >
          + Ajouter une catégorie
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#F8F3EA] text-left text-sm font-semibold text-gray-600">
                <th className="px-6 py-4">
                  Image
                </th>

                <th className="px-6 py-4">
                  Nom
                </th>

                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-16 text-center text-gray-400"
                  >
                    Aucune catégorie pour
                    le moment.
                  </td>
                </tr>
              ) : (
                categories.map(
                  (category) => (
                    <tr
                      key={category._id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-6 py-4">
                        <img
                          src={
                            category.image ||
                            "/logo.png"
                          }
                          alt={category.name}
                          className="
                            h-14
                            w-14
                            rounded-xl
                            object-cover
                            shadow-sm
                            ring-1
                            ring-gray-100
                          "
                        />
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          {category.name}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditCategory(
                                category
                              )
                            }
                            className="
                              rounded-full
                              bg-blue-50
                              px-4
                              py-2
                              text-sm
                              font-medium
                              text-blue-600
                              transition
                              hover:bg-blue-100
                            "
                          >
                            ✏️ Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCategory(
                                category._id
                              )
                            }
                            className="
                              rounded-full
                              bg-red-50
                              px-4
                              py-2
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-100
                            "
                          >
                            🗑 Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          ADD CATEGORY MODAL
          ===================================================== */}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="mb-6 text-2xl font-bold text-[#7C8B73]">
              Ajouter une catégorie
            </h2>

            <CategoryForm
              onSuccess={() => {
                setOpen(false);
                router.refresh();
              }}
            />

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              className="
                mt-6
                w-full
                rounded-full
                border
                border-gray-200
                px-5
                py-2.5
                text-sm
                font-medium
                text-gray-600
                hover:bg-gray-50
              "
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT CATEGORY + SUBCATEGORIES MODAL
          ===================================================== */}

      {editOpen &&
        selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              {/* TITLE */}

              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#7C8B73]">
                  Catégorie
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  Modifier{" "}
                  {selectedCategory.name}
                </h2>
              </div>

              {/* CATEGORY FORM */}

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <h3 className="mb-5 text-lg font-bold text-gray-900">
                  Informations de la catégorie
                </h3>

                <EditCategoryForm
                  category={
                    selectedCategory
                  }
                  onSuccess={() => {
                    router.refresh();
                  }}
                />
              </div>

              {/* SUBCATEGORIES */}

              <div className="mt-6 rounded-2xl border border-gray-100 bg-white">
                <div className="border-b border-gray-100 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Sous-catégories
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Gérez les sous-catégories de{" "}
                        {
                          selectedCategory.name
                        }
                        .
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-[#7C8B73]/10 px-3 py-1 text-sm font-semibold text-[#7C8B73]">
                      {
                        subcategories.length
                      }{" "}
                      sous-catégorie
                      {subcategories.length !==
                      1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {loadingSubcategories ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#7C8B73]/20 border-t-[#7C8B73]" />
                    </div>
                  ) : subcategories.length ===
                    0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center">
                      <div className="text-3xl">
                        📂
                      </div>

                      <p className="mt-3 font-medium text-gray-700">
                        Aucune sous-catégorie
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Cette catégorie ne
                        contient encore
                        aucune
                        sous-catégorie.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subcategories.map(
                        (
                          subcategory
                        ) => (
                          <div
                            key={
                              subcategory._id
                            }
                            className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
                          >
                            {editingSubcategoryId ===
                            subcategory._id ? (
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                  type="text"
                                  value={
                                    editingSubcategoryName
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    setEditingSubcategoryName(
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="
                                    min-w-0
                                    flex-1
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-white
                                    px-4
                                    py-2.5
                                    outline-none
                                    focus:border-[#7C8B73]
                                  "
                                  autoFocus
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={
                                      updateSubcategory
                                    }
                                    className="
                                      rounded-xl
                                      bg-[#7C8B73]
                                      px-4
                                      py-2.5
                                      text-sm
                                      font-semibold
                                      text-white
                                    "
                                  >
                                    Enregistrer
                                  </button>

                                  <button
                                    type="button"
                                    onClick={
                                      cancelEditSubcategory
                                    }
                                    className="
                                      rounded-xl
                                      border
                                      border-gray-200
                                      bg-white
                                      px-4
                                      py-2.5
                                      text-sm
                                      font-medium
                                      text-gray-600
                                    "
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C8B73]/10">
                                    📁
                                  </div>

                                  <span className="font-semibold text-gray-900">
                                    {
                                      subcategory.name
                                    }
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startEditSubcategory(
                                        subcategory
                                      )
                                    }
                                    className="
                                      rounded-xl
                                      bg-blue-50
                                      px-3
                                      py-2
                                      text-sm
                                      font-medium
                                      text-blue-600
                                      hover:bg-blue-100
                                    "
                                  >
                                    ✏️
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteSubcategory(
                                        subcategory._id
                                      )
                                    }
                                    className="
                                      rounded-xl
                                      bg-red-50
                                      px-3
                                      py-2
                                      text-sm
                                      font-medium
                                      text-red-600
                                      hover:bg-red-100
                                    "
                                  >
                                    🗑
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* ADD SUBCATEGORY */}

                  <div className="mt-5 border-t border-gray-100 pt-5">
                    <h4 className="mb-3 font-semibold text-gray-900">
                      Ajouter une sous-catégorie
                    </h4>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        type="text"
                        value={
                          subcategoryName
                        }
                        onChange={(event) =>
                          setSubcategoryName(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            event.preventDefault();
                            void addSubcategory();
                          }
                        }}
                        placeholder="Ex: Nettoyants"
                        className="
                          min-w-0
                          flex-1
                          rounded-xl
                          border
                          border-gray-200
                          px-4
                          py-3
                          outline-none
                          focus:border-[#7C8B73]
                          focus:ring-2
                          focus:ring-[#7C8B73]/10
                        "
                      />

                      <button
                        type="button"
                        onClick={() =>
                          void addSubcategory()
                        }
                        disabled={
                          addingSubcategory
                        }
                        className="
                          rounded-xl
                          bg-[#7C8B73]
                          px-5
                          py-3
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-[#66745F]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >
                        {addingSubcategory
                          ? "Ajout..."
                          : "+ Ajouter"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* CLOSE */}

              <button
                type="button"
                onClick={closeEdit}
                className="
                  mt-6
                  w-full
                  rounded-full
                  border
                  border-gray-200
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-gray-600
                  transition
                  hover:bg-gray-50
                "
              >
                Fermer
              </button>
            </div>
          </div>
        )}
    </div>
  );
}