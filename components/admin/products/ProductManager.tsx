"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import ProductForm from "@/components/admin/products/ProductForm";
import EditProductForm from "@/components/admin/products/EditProductForm";

interface Product {

_id:string;

name:string;

description:string;

price:number;

stock:number;

images:string[];

isActive:boolean;

brand?:{
_id:string;
name:string;
};

category?:{
_id:string;
name:string;
};

}



interface ProductManagerProps{

products:Product[];

}



export default function ProductManager({
products
}:ProductManagerProps){



const [open,setOpen]=useState(false);

const [editOpen,setEditOpen]=useState(false);

const [selectedProduct,setSelectedProduct]=useState<Product | null>(null);


const router = useRouter();





async function deleteProduct(id:string){


const confirmed = window.confirm(
"Supprimer ce produit ?"
);


if(!confirmed){
return;
}



const response = await fetch(
`/api/products/${id}`,
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



<div className="flex justify-between items-center">


<h1
className="
text-4xl
font-bold
text-[#7C8B73]
"
>

Gestion des produits

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

+ Ajouter un produit

</button>


</div>







<div
className="
mt-10
bg-white
rounded-2xl
shadow
overflow-hidden
"
>



<table
className="
w-full
"
>


<thead
className="
bg-[#F8F3EA]
"
>


<tr>


<th className="p-4 text-left">
Image
</th>


<th className="p-4 text-left">
Nom
</th>


<th className="p-4 text-left">
Marque
</th>


<th className="p-4 text-left">
Catégorie
</th>


<th className="p-4 text-left">
Prix
</th>


<th className="p-4 text-left">
Stock
</th>


<th className="p-4 text-left">
Actions
</th>


</tr>


</thead>






<tbody>


{
products.map((product)=>(


<tr
key={product._id}
className="border-t"
>


<td className="p-4">


<img

src={product.images?.[0]}

alt={product.name}

className="
w-16
h-16
rounded-lg
object-cover
"

/>


</td>





<td className="p-4 font-semibold">

{product.name}

</td>





<td className="p-4">

{
product.brand?.name || "-"
}

</td>





<td className="p-4">

{
product.category?.name || "-"
}

</td>





<td className="p-4">

{product.price} TND

</td>





<td className="p-4">

{product.stock}

</td>





<td className="p-4">


<div className="flex gap-3">



<button

onClick={()=>{

setSelectedProduct(product);

setEditOpen(true);

}}

className="
text-blue-500
hover:text-blue-700
"

>

✏️ Modifier

</button>





<button

onClick={()=>deleteProduct(product._id)}

className="
text-red-500
hover:text-red-700
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

<div
className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
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



<h2
className="
text-2xl
font-bold
text-[#7C8B73]
"
>

Ajouter un produit

</h2>





<ProductForm

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
editOpen && selectedProduct && (


<div
className="
fixed
inset-0
bg-black/40
flex
items-center
justify-center
z-50
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



<h2
className="
text-2xl
font-bold
text-[#7C8B73]
"
>

Modifier le produit

</h2>



<EditProductForm

product={selectedProduct}

onSuccess={()=>{

setEditOpen(false);

setSelectedProduct(null);

router.refresh();

}}

/>



<button

onClick={()=>{

setEditOpen(false);

setSelectedProduct(null);

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