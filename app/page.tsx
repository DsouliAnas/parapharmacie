import Image from "next/image";

import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";
import BrandCard from "@/components/BrandCard";
import Button from "@/components/Button";



interface Product {

_id:string;

name:string;

price:number;

images:string[];

stock:number;

}




async function getProducts():Promise<Product[]> {


const res = await fetch(
`${process.env.NEXTAUTH_URL}/api/products`,
{
cache:"no-store"
}
);



if(!res.ok){

throw new Error(
"Failed to fetch products"
);

}



return res.json();


}





const brands=[

"La Roche Posay",
"Bioderma",
"Avène",
"Vichy",
"Caudalie",
"L'Occitane"

];





const categories=[

{
name:"Visage",
image:"https://via.placeholder.com/300"
},

{
name:"Cheveux",
image:"https://via.placeholder.com/300"
},

{
name:"Corps",
image:"https://via.placeholder.com/300"
},

{
name:"Bébé",
image:"https://via.placeholder.com/300"
},

{
name:"Compléments",
image:"https://via.placeholder.com/300"
},

{
name:"Solaire",
image:"https://via.placeholder.com/300"
}

];





export default async function Home(){


const products =
await getProducts();





return (

<main className="bg-[#F8F3EA]">





{/* HERO */}



<section
className="
flex
flex-col
items-center
text-center
py-20
px-10
"
>


<Image

src="/logo1.jpeg"

width={250}

height={250}

alt="Fairy's"

priority

/>



<h1
className="
text-5xl
font-bold
text-[#7C8B73]
mt-8
"
>

Votre beauté,
votre bien-être

</h1>



<p
className="
mt-5
text-gray-600
text-lg
"
>

Découvrez nos produits santé et beauté sélectionnés avec soin.

</p>



<div className="mt-8">

<Button>

Découvrir nos offres

</Button>

</div>



</section>







{/* PROMO */}



<section className="px-10 py-10">


<h2
className="
text-3xl
font-bold
text-[#7C8B73]
mb-8
"
>

Fairys Promo 🔥

</h2>



<div
className="
grid
md:grid-cols-3
gap-8
"
>



{
products.slice(0,3).map((product)=>(


<ProductCard

key={product._id}

_id={product._id}

name={product.name}

price={product.price}

image={
product.images?.[0] ||
"https://via.placeholder.com/400"
}

stock={
product.stock > 0
}

/>


))

}



</div>



</section>









{/* BEST SELLERS */}




<section className="px-10 py-16">


<h2
className="
text-3xl
font-bold
text-[#7C8B73]
mb-8
"
>

Meilleures ventes ⭐

</h2>




<div
className="
grid
md:grid-cols-3
gap-8
"
>



{
products.map((product)=>(


<ProductCard


key={product._id}


_id={product._id}


name={product.name}


price={product.price}


image={
product.images?.[0] ||
"https://via.placeholder.com/400"
}


stock={
product.stock > 0
}


/>


))

}




</div>



</section>









{/* CATEGORIES */}



<section className="px-10 py-16">


<h2
className="
text-3xl
font-bold
text-[#7C8B73]
mb-8
"
>

Nos catégories

</h2>



<div
className="
grid
grid-cols-2
md:grid-cols-6
gap-5
"
>


{
categories.map((category)=>(


<CategoryCard

key={category.name}

{...category}

/>


))

}



</div>



</section>









{/* BRANDS */}




<section className="px-10 py-16">


<h2
className="
text-3xl
font-bold
text-[#7C8B73]
mb-8
"
>

Nos marques populaires

</h2>



<div
className="
grid
grid-cols-2
md:grid-cols-6
gap-5
"
>



{
brands.map((brand)=>(


<BrandCard

key={brand}

name={brand}

/>


))

}



</div>



</section>








{/* WHY FAIRY'S */}



<section
className="
px-10
py-16
bg-white
"
>



<h2
className="
text-center
text-3xl
font-bold
text-[#7C8B73]
"
>

Pourquoi Fairys ?

</h2>





<div
className="
grid
md:grid-cols-3
gap-8
mt-10
text-center
"
>



<div>

<h3 className="font-bold">
Produits authentiques
</h3>

<p>
Des marques fiables et reconnues.
</p>

</div>




<div>

<h3 className="font-bold">
Livraison rapide
</h3>

<p>
Recevez vos commandes facilement.
</p>

</div>





<div>

<h3 className="font-bold">
Conseils beauté
</h3>

<p>
Des produits adaptés à vos besoins.
</p>

</div>




</div>



</section>








{/* NEWSLETTER */}



<section
className="
py-16
text-center
"
>


<h2
className="
text-3xl
font-bold
text-[#7C8B73]
"
>

Recevez nos offres

</h2>



<input

className="
mt-6
border
p-3
rounded-full
w-80
"

placeholder="Votre email"

/>



</section>






</main>

)


}