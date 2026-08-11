"use client";

import { useState } from "react";

interface ProductGalleryProps {
  images?: string[];
}

export default function ProductGallery({
  images = [],
}: ProductGalleryProps) {
  const validImages = images.filter(
    (image) => image && image.trim() !== ""
  );

  const [selectedImage, setSelectedImage] = useState(
    validImages[0] || ""
  );

  if (validImages.length === 0) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-3xl bg-white text-gray-400 shadow-sm">
        Aucune image disponible
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <img
          src={selectedImage}
          alt="Produit"
          className="h-[400px] w-full object-cover md:h-[500px]"
        />
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {validImages.slice(0, 5).map((image, index) => {
            const isSelected =
              selectedImage === image;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(image)}
                className={`overflow-hidden rounded-xl border-2 transition ${
                  isSelected
                    ? "border-[#7C8B73]"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <img
                  src={image}
                  alt={`Aperçu ${index + 1}`}
                  className="h-20 w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}