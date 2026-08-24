"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BrandForm from "@/components/admin/brands/BrandForm";
import EditBrandForm from "@/components/admin/brands/EditBrandForm";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface BrandManagerProps {
  brands: Brand[];
}

export default function BrandManager({
  brands,
}: BrandManagerProps): React.ReactElement {
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [selectedBrand, setSelectedBrand] =
    useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function closeCreateModal(): void {
    setIsCreateOpen(false);
  }

  function closeEditModal(): void {
    setIsEditOpen(false);
    setSelectedBrand(null);
  }

  function openEditModal(brand: Brand): void {
    setSelectedBrand(brand);
    setIsEditOpen(true);
  }

  async function deleteBrand(id: string): Promise<void> {
    if (deletingId) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer cette marque ?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data: unknown = await response.json();

        if (
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
        ) {
          alert(data.error);
        } else {
          alert("Erreur lors de la suppression.");
        }

        return;
      }

      router.refresh();
    } catch (error: unknown) {
      console.error("DELETE BRAND ERROR:", error);
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-[#7C8B73]">
          Gestion des marques
        </h1>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="rounded-full bg-[#7C8B73] px-6 py-3 font-semibold text-white transition hover:bg-[#66745F]"
        >
          + Ajouter
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-2xl bg-white shadow-sm">
        {brands.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Aucune marque disponible.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[#F8F3EA]">
                <tr>
                  <th className="p-4 text-left">Logo</th>
                  <th className="p-4 text-left">Nom</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {brands.map((brand) => (
                  <tr
                    key={brand._id}
                    className="border-t border-gray-100"
                  >
                    <td className="p-4">
                      <img
                        src={brand.logo || "/logo.png"}
                        alt={brand.name}
                        className="h-16 w-16 rounded-lg object-contain"
                      />
                    </td>

                    <td className="p-4 font-semibold text-gray-900">
                      {brand.name}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-4">
                        <button
                          type="button"
                          onClick={() => openEditModal(brand)}
                          className="font-medium text-blue-500 transition hover:text-blue-700"
                        >
                          ✏️ Modifier
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteBrand(brand._id)}
                          disabled={deletingId === brand._id}
                          className="font-medium text-red-500 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === brand._id
                            ? "Suppression..."
                            : "🗑 Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-brand-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8">
            <h2
              id="create-brand-title"
              className="text-2xl font-bold text-[#7C8B73]"
            >
              Ajouter une marque
            </h2>

            <div className="mt-6">
              <BrandForm
                onSuccess={() => {
                  closeCreateModal();
                  router.refresh();
                }}
              />
            </div>

            <button
              type="button"
              onClick={closeCreateModal}
              className="mt-5 rounded-full border border-gray-200 px-5 py-2 transition hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {isEditOpen && selectedBrand && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-brand-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8">
            <h2
              id="edit-brand-title"
              className="text-2xl font-bold text-[#7C8B73]"
            >
              Modifier la marque
            </h2>

            <div className="mt-6">
              <EditBrandForm
                brand={selectedBrand}
                onSuccess={() => {
                  closeEditModal();
                  router.refresh();
                }}
              />
            </div>

            <button
              type="button"
              onClick={closeEditModal}
              className="mt-5 rounded-full border border-gray-200 px-5 py-2 transition hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}