"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import EditCategoryForm from "@/components/admin/categories/EditCategoryForm";


interface Category{

_id:string;

name:string;

image?:string;

}




interface CategoryManagerProps{

categories:Category[];

}





export default function CategoryManager({
categories
}:CategoryManagerProps){



const [open,setOpen]=useState(false);

const [editOpen,setEditOpen]=useState(false);

const [selectedCategory,setSelectedCategory]=useState<Category | null>(null);

const router=useRouter();






async function deleteCategory(id:string){


const confirmDelete =
window.confirm(
"Supprimer cette catégorie ?"
);



if(!confirmDelete){
return;
}




const response =
await fetch(
`/api/categories/${id}`,
{
method:"DELETE"
}
);



if(response.ok){

router.refresh();

}


}





return (

<div>



<div className="
flex
justify-between
items-center
">


<h1
className="
text-4xl
font-bold
text-[#7C8B73]
"
>

Gestion des catégories

</h1>



<button

onClick={()=>setOpen(true)}

className="
bg-[#7C8B73]
text-white
px-6
py-3
rounded-full
"

>

+ Ajouter

</button>


</div>






<div className="
mt-10
bg-white
rounded-2xl
shadow
overflow-hidden
">


<table className="w-full">


<thead className="bg-[#F8F3EA]">


<tr>

<th className="p-4 text-left">
Image
</th>


<th className="p-4 text-left">
Nom
</th>


<th className="p-4 text-left">
Actions
</th>


</tr>


</thead>





<tbody>


{
categories.map((category)=>(


<tr
key={category._id}
className="border-t"
>


<td className="p-4">


<img

src={category.image || "/logo.png"}

className="
w-16
h-16
rounded-lg
object-cover
"

alt={category.name}

/>


</td>



<td className="p-4 font-semibold">

{category.name}

</td>




<td className="p-4">


<div className="flex gap-3">


<button

onClick={()=>{

setSelectedCategory(category);

setEditOpen(true);

}}

className="
text-blue-500
"

>

✏️ Modifier

</button>




<button

onClick={()=>deleteCategory(category._id)}

className="
text-red-500
"

>

🗑 Supprimer

</button>



</div>


</td>



</tr>


))
}


</tbody>


</table>


</div>






{
open && (

<div className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
">


<div className="
bg-white
p-8
rounded-2xl
w-full
max-w-lg
">


<h2 className="
text-2xl
font-bold
text-[#7C8B73]
">

Ajouter catégorie

</h2>




<CategoryForm

onSuccess={()=>{

setOpen(false);

router.refresh();

}}

/>



<button

onClick={()=>setOpen(false)}

className="
mt-5
border
px-5
py-2
rounded-full
"

>

Fermer

</button>



</div>


</div>

)

}

{
editOpen && selectedCategory && (

<div
className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
"
>


<div
className="
bg-white
rounded-2xl
p-8
w-full
max-w-lg
"
>


<h2 className="
text-2xl
font-bold
text-[#7C8B73]
mb-5
">

Modifier catégorie

</h2>



<EditCategoryForm

category={selectedCategory}

onSuccess={()=>{

setEditOpen(false);

setSelectedCategory(null);

router.refresh();

}}

/>



<button

onClick={()=>{

setEditOpen(false);

setSelectedCategory(null);

}}

className="
mt-5
border
px-5
py-2
rounded-full
"

>

Fermer

</button>



</div>


</div>


)
}

</div>

)

}