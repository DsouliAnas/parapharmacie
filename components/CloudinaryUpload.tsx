"use client";

import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  buttonText?: string;
}

interface CloudinaryUploadResult {
  secure_url?: string;
}

export default function CloudinaryUpload({
  onUpload,
  buttonText = "Télécharger une image",
}: CloudinaryUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string>("");

  return (
    <div className="space-y-3">
      <CldUploadWidget
        uploadPreset="fairys_uploads"
        onSuccess={(result) => {
          const info = result.info as CloudinaryUploadResult;

          if (!info.secure_url) {
            return;
          }

          setUploadedImage(info.secure_url);
          onUpload(info.secure_url);
        }}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open()}
            className="rounded-full bg-[#7C8B73] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            {buttonText}
          </button>
        )}
      </CldUploadWidget>

      {uploadedImage && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={uploadedImage}
            alt="Image téléchargée"
            className="h-32 w-32 object-cover"
          />
        </div>
      )}
    </div>
  );
}