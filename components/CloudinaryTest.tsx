"use client";

import CloudinaryUpload from "@/components/CloudinaryUpload";

export default function CloudinaryTest() {
  return (
    <CloudinaryUpload
      onUpload={(url: string) => {
        console.log("CLOUDINARY URL:", url);
      }}
    />
  );
}