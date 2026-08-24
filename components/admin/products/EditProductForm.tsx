"use client";

import { useEffect, useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";

interface ProductReference {
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
  stock: number;
  images: string[];
  isActive: boolean;
  brand?: ProductReference;
  category?: ProductReference;
  subcategory?: ProductReference;
}

interface Category {
  _id: string;
  name: string;
}

interface Subcategory {
  _id: string;
  name: string;
  category: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface EditProductFormProps {
  product: Product;
  onSuccess: () => void;
}

interface EditProductFormState {
  name: string;
  description: string;
  benefits: string;
  usage: string;
  price: string;
  discountPrice: string;
  images: string;
  category: string;
  subcategory: string;
  brand: string;
  stock: string;
  isActive: boolean;
}

interface ErrorResponse {
  error?: string;
}

export default function EditProductForm({
  product,
  onSuccess,
}: EditProductFormProps): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<
    Subcategory[]
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<EditProductFormState>({
    name: product.name,
    description: product.description,
    benefits: product.benefits?.join("\n") || "",
    usage: product.usage?.join("\n") || "",
    price: String(product.price),
    discountPrice:
      product.discountPrice !== undefined &&
      product.discountPrice !== null &&
      product.discountPrice > 0
        ? String(product.discountPrice)
        : "",
    images: product.images?.[0] || "",
    category: product.category?._id || "",
    subcategory: product.subcategory?._id || "",
    brand: product.brand?._id || "",
    stock: String(product.stock),
    isActive: product.isActive,
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD CATEGORIES AND BRANDS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const [
          categoriesResponse,
          brandsResponse,
        ] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);

        if (
          !categoriesResponse.ok ||
          !brandsResponse.ok
        ) {
          throw new Error(
            "Failed to load categories or brands"
          );
        }

        const categoriesData: Category[] =
          await categoriesResponse.json();

        const brandsData: Brand[] =
          await brandsResponse.json();

        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error(
          "LOAD EDIT PRODUCT DATA ERROR:",
          error
        );
      }
    }

    void loadData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD SUBCATEGORIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    async function loadSubcategories(): Promise<void> {
      if (!form.category) {
        setSubcategories([]);
        return;
      }

      try {
        const response = await fetch(
          `/api/subcategories?category=${form.category}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load subcategories"
          );
        }

        const data: Subcategory[] =
          await response.json();

        setSubcategories(data);

        const selectedSubcategoryExists =
          data.some(
            (subcategory) =>
              subcategory._id ===
              form.subcategory
          );

        if (
          form.subcategory &&
          !selectedSubcategoryExists
        ) {
          setForm((prev) => ({
            ...prev,
            subcategory: "",
          }));
        }
      } catch (error) {
        console.error(
          "LOAD SUBCATEGORIES ERROR:",
          error
        );

        setSubcategories([]);

        setForm((prev) => ({
          ...prev,
          subcategory: "",
        }));
      }
    }

    void loadSubcategories();
  }, [form.category, form.subcategory]);

  /*
  |--------------------------------------------------------------------------
  | HANDLE INPUT CHANGES
  |--------------------------------------------------------------------------
  */

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ): void {
    const { name, value } = e.target;

    if (name === "category") {
      setForm((prev) => ({
        ...prev,
        category: value,
        subcategory: "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /*
  |--------------------------------------------------------------------------
  | CONVERT TEXTAREA TO ARRAY
  |--------------------------------------------------------------------------
  */

  function convertTextToArray(
    value: string
  ): string[] {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    const name = form.name.trim();
    const description =
      form.description.trim();

    const benefits =
      convertTextToArray(form.benefits);

    const usage =
      convertTextToArray(form.usage);

    const price = Number(form.price);

    const discountPrice =
      form.discountPrice.trim() !== ""
        ? Number(form.discountPrice)
        : undefined;

    const stock = Number(form.stock);

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!name) {
      alert(
        "Veuillez entrer le nom du produit."
      );
      return;
    }

    if (!description) {
      alert(
        "Veuillez entrer une description."
      );
      return;
    }

    if (!form.images) {
      alert(
        "Veuillez ajouter une image."
      );
      return;
    }

    if (!form.category) {
      alert(
        "Veuillez choisir une catégorie."
      );
      return;
    }

    if (!form.subcategory) {
      alert(
        "Veuillez choisir une sous-catégorie."
      );
      return;
    }

    if (!form.brand) {
      alert(
        "Veuillez choisir une marque."
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      alert(
        "Veuillez entrer un prix valide."
      );
      return;
    }

    if (
      discountPrice !== undefined &&
      (!Number.isFinite(discountPrice) ||
        discountPrice <= 0)
    ) {
      alert(
        "Veuillez entrer un prix promotionnel valide."
      );
      return;
    }

    if (
      discountPrice !== undefined &&
      discountPrice >= price
    ) {
      alert(
        "Le prix promotionnel doit être inférieur au prix normal."
      );
      return;
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      alert(
        "Veuillez entrer un stock valide."
      );
      return;
    }

    setLoading(true);

    /*
    |--------------------------------------------------------------------------
    | UPDATE PRODUCT
    |--------------------------------------------------------------------------
    */

    try {
      const response = await fetch(
        `/api/products/${product._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            benefits,
            usage,
            price,
            discountPrice:
              discountPrice ?? null,
            images: [form.images],
            category: form.category,
            subcategory:
              form.subcategory,
            brand: form.brand,
            stock,
            isActive: form.isActive,
          }),
        }
      );

      const data: ErrorResponse =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Erreur lors de la modification du produit."
        );

        return;
      }

      onSuccess();
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      alert(
        "Une erreur est survenue lors de la modification du produit."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* NAME */}

      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        className="w-full rounded border p-3"
        placeholder="Nom du produit"
        required
      />

      {/* DESCRIPTION */}

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        className="w-full rounded border p-3"
        placeholder="Description"
        rows={5}
        required
      />

      {/* BENEFITS */}

      <div className="space-y-2">
        <label
          htmlFor="benefits"
          className="text-sm font-medium text-gray-700"
        >
          Avantages du produit
        </label>

        <textarea
          id="benefits"
          name="benefits"
          value={form.benefits}
          onChange={handleChange}
          className="w-full rounded border p-3"
          placeholder={
            "Un avantage par ligne\nExemple :\nGoût agréable\nFormat pratique"
          }
          rows={5}
        />

        <p className="text-xs text-gray-500">
          Écrivez un avantage par ligne.
        </p>
      </div>

      {/* USAGE */}

      <div className="space-y-2">
        <label
          htmlFor="usage"
          className="text-sm font-medium text-gray-700"
        >
          Conseils dutilisation
        </label>

        <textarea
          id="usage"
          name="usage"
          value={form.usage}
          onChange={handleChange}
          className="w-full rounded border p-3"
          placeholder={
            "Une étape par ligne\nExemple :\nFaire infuser un sachet dans une tasse d'eau chaude\nLaisser infuser quelques minutes"
          }
          rows={5}
        />

        <p className="text-xs text-gray-500">
          Écrivez une étape par ligne.
        </p>
      </div>

      {/* PRICE */}

      <input
        type="number"
        min="0"
        step="0.01"
        name="price"
        value={form.price}
        onChange={handleChange}
        className="w-full rounded border p-3"
        placeholder="Prix normal (TND)"
        required
      />

      {/* DISCOUNT PRICE */}

      <input
        type="number"
        min="0"
        step="0.01"
        name="discountPrice"
        value={form.discountPrice}
        onChange={handleChange}
        className="w-full rounded border p-3"
        placeholder="Prix promotionnel (optionnel)"
      />

      {/* IMAGE */}

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Image du produit
        </p>

        <CloudinaryUpload
          onUpload={(url: string) => {
            setForm((prev) => ({
              ...prev,
              images: url,
            }));
          }}
          buttonText={
            form.images
              ? "Changer l'image"
              : "Télécharger une image"
          }
        />

        {form.images && (
          <img
            src={form.images}
            alt={form.name}
            className="h-32 w-32 rounded-lg object-cover"
          />
        )}
      </div>

      {/* CATEGORY */}

      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="w-full rounded border p-3"
        required
      >
        <option value="">
          Choisir catégorie
        </option>

        {categories.map((category) => (
          <option
            key={category._id}
            value={category._id}
          >
            {category.name}
          </option>
        ))}
      </select>

      {/* SUBCATEGORY */}

      <select
        name="subcategory"
        value={form.subcategory}
        onChange={handleChange}
        className="w-full rounded border p-3"
        disabled={!form.category}
        required
      >
        <option value="">
          {form.category
            ? "Choisir sous-catégorie"
            : "Choisir d'abord une catégorie"}
        </option>

        {subcategories.map(
          (subcategory) => (
            <option
              key={subcategory._id}
              value={subcategory._id}
            >
              {subcategory.name}
            </option>
          )
        )}
      </select>

      {/* BRAND */}

      <select
        name="brand"
        value={form.brand}
        onChange={handleChange}
        className="w-full rounded border p-3"
        required
      >
        <option value="">
          Choisir marque
        </option>

        {brands.map((brand) => (
          <option
            key={brand._id}
            value={brand._id}
          >
            {brand.name}
          </option>
        ))}
      </select>

      {/* STOCK */}

      <input
        type="number"
        min="0"
        step="1"
        name="stock"
        value={form.stock}
        onChange={handleChange}
        className="w-full rounded border p-3"
        placeholder="Stock"
        required
      />

      {/* ACTIVE */}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              isActive:
                e.target.checked,
            }));
          }}
        />

        <span>Produit actif</span>
      </label>

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-[#7C8B73] px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Sauvegarde en cours..."
          : "Sauvegarder les modifications"}
      </button>
    </form>
  );
}