interface BrandCardProps {
  readonly name: string;
}

export default function BrandCard({
  name,
}: BrandCardProps) {
  return (
    <div
      className="
        flex
        min-h-24
        items-center
        justify-center
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-5
        text-center
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-6
      "
    >
      <h3
        className="
          break-words
          text-base
          font-semibold
          leading-6
          text-[#7C8B73]
          sm:text-lg
        "
      >
        {name}
      </h3>
    </div>
  );
}