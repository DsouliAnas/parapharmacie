import { categories } from "@/constants/categories";


export default function CategoryMenu() {

  return (

    <nav className="border-t bg-white">

      <div className="flex gap-6 px-8 py-3 text-sm">

        {categories.map((category)=>(
          
          <a
            key={category.slug}
            href={`/shop/${category.slug}`}
            className="hover:text-pink-500 whitespace-nowrap"
          >
            {category.name}
          </a>

        ))}

      </div>

    </nav>

  );
}