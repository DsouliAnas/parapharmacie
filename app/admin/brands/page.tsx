import BrandManager from "@/components/admin/brands/BrandManager";



async function getBrands(){


const res =
await fetch(
`${process.env.NEXTAUTH_URL}/api/brands`,
{
cache:"no-store"
}
);



if(!res.ok){

throw new Error(
"Failed to fetch brands"
);

}



return res.json();

}





export default async function BrandsPage(){


const brands =
await getBrands();



return (

<main className="
min-h-screen
bg-[#F8F3EA]
p-10
">


<BrandManager
brands={brands}
/>


</main>

)

}