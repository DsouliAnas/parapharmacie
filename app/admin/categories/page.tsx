import CategoryManager from "@/components/admin/categories/CategoryManager";



async function getCategories(){


const res =
await fetch(
`${process.env.NEXTAUTH_URL}/api/categories`,
{
cache:"no-store"
}
);



if(!res.ok){

throw new Error(
"Failed to fetch categories"
);

}



return res.json();


}





export default async function CategoriesPage(){


const categories =
await getCategories();



return (

<main className="
min-h-screen
bg-[#F8F3EA]
p-10
">


<CategoryManager
categories={categories}
/>


</main>

)

}