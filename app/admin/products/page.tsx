import ProductManager from "@/components/admin/products/ProductManager";


async function getProducts(){

const res = await fetch(
`${process.env.NEXTAUTH_URL}/api/products`,
{
cache:"no-store"
}
);


if(!res.ok){
throw new Error("Failed to fetch products");
}


return res.json();

}



export default async function ProductsPage(){


const products = await getProducts();



return (

<main className="min-h-screen bg-[#F8F3EA] p-10">


<ProductManager
products={products}
/>


</main>

)

}