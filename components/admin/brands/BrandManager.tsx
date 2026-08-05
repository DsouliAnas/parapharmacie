"use client";


import {useState} from "react";
import {useRouter} from "next/navigation";
import BrandForm from "@/components/admin/brands/BrandForm";
import EditBrandForm from "@/components/admin/brands/EditBrandForm";



interface Brand{

_id:string;

name:string;

logo?:string;

}



interface BrandManagerProps{

brands:Brand[];

}





export default function BrandManager({
brands
}:BrandManagerProps){



const router=useRouter();



const [open,setOpen]=useState(false);

const [editOpen,setEditOpen]=useState(false);

const [selectedBrand,setSelectedBrand]=useState<Brand|null>(null);






async function deleteBrand(id:string){


const confirmDelete =
window.confirm(
"Supprimer cette marque ?"
);



if(!confirmDelete){
return;
}



const response =
await fetch(
`/api/brands/${id}`,
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


<h1 className="
text-4xl
font-bold
text-[#7C8B73]
">

Gestion des marques

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
Logo
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
brands.map((brand)=>(


<tr
key={brand._id}
className="border-t"
>


<td className="p-4">


<img

src={brand.logo || "/logo.png"}

className="
w-16
h-16
object-cover
rounded-lg
"

alt={brand.name}

/>


</td>



<td className="p-4 font-semibold">

{brand.name}

</td>




<td className="p-4">


<button

onClick={()=>{

setSelectedBrand(brand);

setEditOpen(true);

}}

className="
text-blue-500
mr-4
"

>

✏️ Modifier

</button>




<button

onClick={()=>deleteBrand(brand._id)}

className="
text-red-500
"

>

🗑 Supprimer

</button>


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

Ajouter marque

</h2>



<BrandForm

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
editOpen && selectedBrand && (

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

Modifier marque

</h2>



<EditBrandForm

brand={selectedBrand}

onSuccess={()=>{

setEditOpen(false);

setSelectedBrand(null);

router.refresh();

}}

/>



</div>


</div>

)

}



</div>

)

}