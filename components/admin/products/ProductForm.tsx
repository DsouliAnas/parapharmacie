"use client";

import { useEffect, useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";

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

interface ProductFormProps {
  onSuccess: () => void;
}

interface ProductFormState {
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

export default function ProductForm({
  onSuccess,
}: ProductFormProps): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<
    Subcategory[]
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    benefits: "",
    usage: "",
    price: "",
    discountPrice: "",
    images: "",
    category: "",
    subcategory: "",
    brand: "",
    stock: "",
    isActive: true,
  });

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
          "LOAD PRODUCT FORM DATA ERROR:",
          error
        );
      }
    }

    void loadData();
  }, []);

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
      } catch (error) {
        console.error(
          "LOAD SUBCATEGORIES ERROR:",
          error
        );

        setSubcategories([]);
      }
    }

    void loadSubcategories();
  }, [form.category]);

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

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    const benefits = form.benefits
      .split("\n")
      .map((benefit) => benefit.trim())
      .filter((benefit) => benefit.length > 0);

    const usage = form.usage
      .split("\n")
      .map((instruction) => instruction.trim())
      .filter((instruction) => instruction.length > 0);

    const price = Number(form.price);

    const discountPrice =
      form.discountPrice.trim() !== ""
        ? Number(form.discountPrice)
        : undefined;

    const stock = Number(form.stock);

    if (!name) {
      alert("Veuillez entrer le nom du produit.");
      return;
    }

    if (!description) {
      alert("Veuillez entrer une description.");
      return;
    }

    if (benefits.length === 0) {
      alert("Veuillez ajouter au moins un bénéfice.");
      return;
    }

    if (usage.length === 0) {
      alert(
        "Veuillez ajouter au moins une indication d'utilisation."
      );
      return;
    }

    if (!form.images) {
      alert("Veuillez ajouter une image.");
      return;
    }

    if (!form.category) {
      alert("Veuillez choisir une catégorie.");
      return;
    }

    if (!form.subcategory) {
      alert("Veuillez choisir une sous-catégorie.");
      return;
    }

    if (!form.brand) {
      alert("Veuillez choisir une marque.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      alert("Veuillez entrer un prix valide.");
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

    if (!Number.isInteger(stock) || stock < 0) {
      alert("Veuillez entrer un stock valide.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          benefits,
          usage,
          price,
          discountPrice: discountPrice ?? null,
          images: [form.images],
          category: form.category,
          subcategory: form.subcategory,
          brand: form.brand,
          stock,
          isActive: form.isActive,
        }),
      });

      const data: ErrorResponse =
        await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Erreur lors de la création du produit."
        );

        return;
      }

      setForm({
        name: "",
        description: "",
        benefits: "",
        usage: "",
        price: "",
        discountPrice: "",
        images: "",
        category: "",
        subcategory: "",
        brand: "",
        stock: "",
        isActive: true,
      });

      setSubcategories([]);

      onSuccess();
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      alert(
        "Une erreur est survenue lors de la création du produit."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      {/* NAME */}

      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nom du produit
        </label>

        <input
          id="name"
          name="name"
          placeholder="Nom du produit"
          className="w-full rounded border p-3"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      {/* DESCRIPTION */}

      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          placeholder="Description du produit"
          className="min-h-[120px] w-full rounded border p-3"
          value={form.description}
          onChange={handleChange}
          required
        />
      </div>

      {/* BENEFITS */}

      <div>
        <label
          htmlFor="benefits"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Bénéfices
        </label>

        <textarea
          id="benefits"
          name="benefits"
          placeholder={
            "Un bénéfice par ligne\nExemple :\nGoût agréable\nArôme végétal\nFormat pratique"
          }
          className="min-h-[130px] w-full rounded border p-3"
          value={form.benefits}
          onChange={handleChange}
        />

        <p className="mt-1 text-xs text-gray-500">
          Écrivez un bénéfice par ligne.
        </p>
      </div>

      {/* USAGE */}

      <div>
        <label
          htmlFor="usage"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Utilisation
        </label>

        <textarea
          id="usage"
          name="usage"
          placeholder={
            "Une indication par ligne\nExemple :\nFaire infuser un sachet dans une tasse d'eau chaude\nLaisser infuser quelques minutes"
          }
          className="min-h-[130px] w-full rounded border p-3"
          value={form.usage}
          onChange={handleChange}
        />

        <p className="mt-1 text-xs text-gray-500">
          Écrivez une indication dutilisation par ligne.
        </p>
      </div>

      {/* PRICE */}

      <div>
        <label
          htmlFor="price"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Prix normal
        </label>

        <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Prix normal (TND)"
          className="w-full rounded border p-3"
          value={form.price}
          onChange={handleChange}
          required
        />
      </div>

      {/* DISCOUNT PRICE */}

      <div>
        <label
          htmlFor="discountPrice"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Prix promotionnel
        </label>

        <input
          id="discountPrice"
          name="discountPrice"
          type="number"
          min="0"
          step="0.01"
          placeholder="Prix promotionnel (optionnel)"
          className="w-full rounded border p-3"
          value={form.discountPrice}
          onChange={handleChange}
        />
      </div>

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
          <div className="space-y-2">
            <p className="text-sm text-green-600">
              ✓ Image téléchargée avec succès
            </p>

            <img
              src={form.images}
              alt="Aperçu du produit"
              className="h-32 w-32 rounded-lg object-cover"
            />
          </div>
        )}
      </div>

      {/* CATEGORY */}

      <div>
        <label
          htmlFor="category"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Catégorie
        </label>

        <select
          id="category"
          name="category"
          className="w-full rounded border p-3"
          value={form.category}
          onChange={handleChange}
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
      </div>

      {/* SUBCATEGORY */}

      <div>
        <label
          htmlFor="subcategory"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Sous-catégorie
        </label>

        <select
          id="subcategory"
          name="subcategory"
          className="w-full rounded border p-3"
          value={form.subcategory}
          onChange={handleChange}
          disabled={!form.category}
          required
        >
          <option value="">
            {form.category
              ? "Choisir sous-catégorie"
              : "Choisir d'abord une catégorie"}
          </option>

          {subcategories.map((subcategory) => (
            <option
              key={subcategory._id}
              value={subcategory._id}
            >
              {subcategory.name}
            </option>
          ))}
        </select>
      </div>

      {/* BRAND */}

      <div>
        <label
          htmlFor="brand"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Marque
        </label>

        <select
          id="brand"
          name="brand"
          className="w-full rounded border p-3"
          value={form.brand}
          onChange={handleChange}
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
      </div>

      {/* STOCK */}

      <div>
        <label
          htmlFor="stock"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Stock
        </label>

        <input
          id="stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          placeholder="Stock"
          className="w-full rounded border p-3"
          value={form.stock}
          onChange={handleChange}
          required
        />
      </div>

      {/* ACTIVE */}

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isActive"
          checked={form.isActive}
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              isActive: e.target.checked,
            }));
          }}
        />

        <span>Produit actif</span>
      </label>

      {/* SUBMIT */}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#7C8B73] px-6 py-3 text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Création en cours..."
          : "Créer le produit"}
      </button>
    </form>
  );
}