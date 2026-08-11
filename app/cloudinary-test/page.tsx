import CloudinaryTest from "@/components/CloudinaryTest";

export default function CloudinaryTestPage() {
  return (
    <main className="min-h-screen bg-[#F8F3EA] p-10">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[#7C8B73]">
          Cloudinary Test
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Téléchargez une image pour tester Cloudinary.
        </p>

        <div className="mt-8">
          <CloudinaryTest />
        </div>
      </div>
    </main>
  );
}