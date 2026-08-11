"use client";

import { useEffect, useState } from "react";
import CloudinaryUpload from "@/components/CloudinaryUpload";

interface Category {
  _id: string;
  name: string;
}

interface Brand {
  _id: string;
  name: string;
}

interface ProductFormProps {
  onSuccess: () => void;
}

export default function ProductForm({
  onSuccess,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    images: "",
    category: "",
    brand: "",
    stock: "",
    isActive: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesResponse, brandsResponse] =
          await Promise.all([
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

    loadData();
  }, []);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLTextAreaElement |
        HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!form.images) {
      alert("Veuillez ajouter une image.");
      return;
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          images: [form.images],
          category: form.category,
          brand: form.brand,
          stock: Number(form.stock),
          isActive: form.isActive,
        }),
      });

      if (!response.ok) {
        const data: { error?: string } =
          await response.json();

        alert(
          data.error ||
            "Erreur lors de la création du produit."
        );

        return;
      }

      setForm({
        name: "",
        description: "",
        price: "",
        images: "",
        category: "",
        brand: "",
        stock: "",
        isActive: true,
      });

      onSuccess();
    } catch (error) {
      console.error(
        "CREATE PRODUCT ERROR:",
        error
      );

      alert(
        "Une erreur est survenue lors de la création du produit."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <input
        name="name"
        placeholder="Nom du produit"
        className="w-full rounded border p-3"
        value={form.name}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description"
        className="w-full rounded border p-3"
        value={form.description}
        onChange={handleChange}
        required
      />

      <input
        name="price"
        type="number"
        min="0"
        step="0.01"
        placeholder="Prix TND"
        className="w-full rounded border p-3"
        value={form.price}
        onChange={handleChange}
        required
      />

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
          <p className="text-sm text-green-600">
            ✓ Image téléchargée avec succès
          </p>
        )}
      </div>

      <select
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

      <select
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

      <input
        name="stock"
        type="number"
        min="0"
        placeholder="Stock"
        className="w-full rounded border p-3"
        value={form.stock}
        onChange={handleChange}
        required
      />

      <button
        type="submit"
        className="rounded-full bg-[#7C8B73] px-6 py-3 text-white transition hover:opacity-90"
      >
        Créer le produit
      </button>
    </form>
  );
}