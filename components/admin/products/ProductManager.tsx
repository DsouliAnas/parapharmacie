"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ProductForm from "@/components/admin/products/ProductForm";
import EditProductForm from "@/components/admin/products/EditProductForm";

interface ProductBrand {
  _id: string;
  name: string;
}

interface ProductCategory {
  _id: string;
  name: string;
}

interface ProductSubcategory {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;

  benefits: string[];
  usage: string[];

  price: number;
  discountPrice?: number;

  images: string[];

  category?: ProductCategory;
  subcategory?: ProductSubcategory;
  brand?: ProductBrand;

  stock: number;
  isActive: boolean;
}

interface ProductManagerProps {
  products: Product[];
}

interface ApiErrorResponse {
  error?: string;
}

export default function ProductManager({
  products,
}: ProductManagerProps): React.ReactElement {
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] =
    useState<boolean>(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  async function deleteProduct(
    id: string
  ): Promise<void> {
    if (deletingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce produit ?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(
        `/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      let data: ApiErrorResponse = {};

      try {
        data =
          (await response.json()) as ApiErrorResponse;
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Erreur lors de la suppression du produit."
        );
      }

      router.refresh();
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la suppression du produit.";

      alert(message);
    } finally {
      setDeletingId(null);
    }
  }

  function closeAddModal(): void {
    setOpen(false);
  }

  function closeEditModal(): void {
    setEditOpen(false);
    setSelectedProduct(null);
  }

  function openEditModal(
    product: Product
  ): void {
    setSelectedProduct(product);
    setEditOpen(true);
  }

  return (
    <div className="w-full">
      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#7C8B73]">
            Gestion des produits
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Gérez vos produits, prix, stocks et
            informations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            rounded-xl
            bg-[#7C8B73]
            px-6
            py-3
            font-medium
            text-white
            shadow-sm
            transition
            hover:bg-[#6d7b65]
            hover:shadow-md
          "
        >
          + Ajouter un produit
        </button>
      </div>

      {/* PRODUCTS TABLE */}

      <div
        className="
          mt-8
          overflow-hidden
          rounded-2xl
          border
          border-gray-100
          bg-white
          shadow-sm
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-[#F8F3EA]">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Image
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Nom
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Marque
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Catégorie
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Sous-catégorie
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Prix
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Stock
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Statut
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-gray-500"
                  >
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isDeleting =
                    deletingId === product._id;

                  const hasDiscount =
                    product.discountPrice !==
                      undefined &&
                    product.discountPrice <
                      product.price;

                  return (
                    <tr
                      key={product._id}
                      className="
                        border-t
                        border-gray-100
                        transition
                        hover:bg-gray-50
                      "
                    >
                      {/* IMAGE */}

                      <td className="px-5 py-4">
                        <div
                          className="
                            h-16
                            w-16
                            overflow-hidden
                            rounded-xl
                            border
                            border-gray-100
                            bg-gray-50
                          "
                        >
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </td>

                      {/* NAME */}

                      <td className="px-5 py-4">
                        <p className="max-w-[220px] truncate font-semibold text-gray-800">
                          {product.name}
                        </p>
                      </td>

                      {/* BRAND */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {product.brand?.name || "-"}
                      </td>

                      {/* CATEGORY */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {product.category?.name || "-"}
                      </td>

                      {/* SUBCATEGORY */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {product.subcategory?.name ||
                          "-"}
                      </td>

                      {/* PRICE */}

                      <td className="px-5 py-4">
                        {hasDiscount ? (
                          <div>
                            <p className="font-semibold text-[#7C8B73]">
                              {product.discountPrice?.toFixed(
                                2
                              )}{" "}
                              TND
                            </p>

                            <p className="text-xs text-gray-400 line-through">
                              {product.price.toFixed(
                                2
                              )}{" "}
                              TND
                            </p>
                          </div>
                        ) : (
                          <p className="font-semibold text-gray-800">
                            {product.price.toFixed(
                              2
                            )}{" "}
                            TND
                          </p>
                        )}
                      </td>

                      {/* STOCK */}

                      <td className="px-5 py-4">
                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-medium
                            ${
                              product.stock === 0
                                ? "bg-red-100 text-red-700"
                                : product.stock <= 5
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                            }
                          `}
                        >
                          {product.stock === 0
                            ? "Rupture"
                            : `${product.stock} unités`}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-xs
                            font-medium
                            ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
                        >
                          {product.isActive
                            ? "Actif"
                            : "Inactif"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(product)
                            }
                            disabled={isDeleting}
                            className="
                              rounded-lg
                              border
                              border-blue-100
                              bg-blue-50
                              px-3
                              py-2
                              text-sm
                              font-medium
                              text-blue-600
                              transition
                              hover:bg-blue-100
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteProduct(
                                product._id
                              )
                            }
                            disabled={
                              deletingId !== null
                            }
                            className="
                              rounded-lg
                              border
                              border-red-100
                              bg-red-50
                              px-3
                              py-2
                              text-sm
                              font-medium
                              text-red-600
                              transition
                              hover:bg-red-100
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {isDeleting
                              ? "Suppression..."
                              : "Supprimer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}

      {open && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeAddModal();
            }
          }}
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
            "
          >
            <div
              className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                bg-white
                px-7
                py-5
              "
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Ajouter un produit
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Ajoutez un nouveau produit à
                  votre catalogue.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                aria-label="Fermer"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-xl
                  text-gray-500
                  transition
                  hover:bg-gray-200
                  hover:text-gray-800
                "
              >
                ×
              </button>
            </div>

            <div className="p-7">
              <ProductForm
                onSuccess={() => {
                  closeAddModal();
                  router.refresh();
                }}
              />

              <button
                type="button"
                onClick={closeAddModal}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  px-5
                  py-3
                  font-medium
                  text-gray-600
                  transition
                  hover:bg-gray-50
                "
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}

      {editOpen && selectedProduct && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeEditModal();
            }
          }}
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-2xl
              overflow-y-auto
              rounded-3xl
              bg-white
              shadow-2xl
            "
          >
            <div
              className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                bg-white
                px-7
                py-5
              "
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Modifier le produit
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Modifiez les informations de
                  votre produit.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                aria-label="Fermer"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-100
                  text-xl
                  text-gray-500
                  transition
                  hover:bg-gray-200
                  hover:text-gray-800
                "
              >
                ×
              </button>
            </div>

            <div className="p-7">
              <EditProductForm
                product={selectedProduct}
                onSuccess={() => {
                  closeEditModal();
                  router.refresh();
                }}
              />

              <button
                type="button"
                onClick={closeEditModal}
                className="
                  mt-4
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  px-5
                  py-3
                  font-medium
                  text-gray-600
                  transition
                  hover:bg-gray-50
                "
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}