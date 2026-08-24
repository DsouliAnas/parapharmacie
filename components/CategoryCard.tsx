interface CategoryCardProps {
  readonly name: string;
  readonly image: string;
}

export default function CategoryCard({
  name,
  image,
}: CategoryCardProps) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-100
        bg-white
        p-4
        text-center
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        sm:p-5
      "
    >
      <div className="overflow-hidden rounded-xl bg-gray-100">
        {image.trim() ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className="
              h-32
              w-full
              object-cover
              transition-transform
              duration-300
              hover:scale-105
              sm:h-36
            "
          />
        ) : (
          <div
            className="
              flex
              h-32
              items-center
              justify-center
              text-sm
              text-gray-400
              sm:h-36
            "
          >
            Aucune image
          </div>
        )}
      </div>

      <h3
        className="
          mt-4
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