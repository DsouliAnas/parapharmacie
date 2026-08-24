"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  buttonText?: string;
}

interface CloudinaryUploadInfo {
  secure_url?: string;
}

function isCloudinaryUploadInfo(
  value: unknown
): value is CloudinaryUploadInfo {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    data.secure_url === undefined ||
    typeof data.secure_url === "string"
  );
}

export default function CloudinaryUpload({
  onUpload,
  buttonText = "Télécharger une image",
}: CloudinaryUploadProps) {
  const [uploadedImage, setUploadedImage] =
    useState<string>("");

  const [error, setError] = useState<string>("");

  return (
    <div className="w-full space-y-3">
      <CldUploadWidget
        uploadPreset="fairys_uploads"
        options={{
          resourceType: "image",
          maxFiles: 1,
          multiple: false,
          clientAllowedFormats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
          ],
          maxFileSize: 5_000_000,
        }}
        onSuccess={(result) => {
          setError("");

          const info = result.info;

          if (!isCloudinaryUploadInfo(info)) {
            setError(
              "Impossible de récupérer les informations de l'image."
            );
            return;
          }

          if (!info.secure_url) {
            setError(
              "L'image a été téléchargée, mais son URL est introuvable."
            );
            return;
          }

          setUploadedImage(info.secure_url);
          onUpload(info.secure_url);
        }}
        onError={() => {
          setError(
            "Le téléchargement de l'image a échoué. Veuillez réessayer."
          );
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => {
              setError("");
              open();
            }}
            className="w-full rounded-full bg-[#7C8B73] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#66745F] focus:outline-none focus:ring-2 focus:ring-[#7C8B73]/40 focus:ring-offset-2 active:scale-[0.98] sm:w-auto"
          >
            {buttonText}
          </button>
        )}
      </CldUploadWidget>

      {error && (
        <p
          role="alert"
          className="text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {uploadedImage && (
        <div className="w-fit overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedImage}
            alt="Aperçu de l'image téléchargée"
            className="h-32 w-32 object-cover sm:h-40 sm:w-40"
          />
        </div>
      )}
    </div>
  );
}