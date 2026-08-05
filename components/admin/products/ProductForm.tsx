"use client";

import { useEffect, useState } from "react";


interface Category {

_id:string;
name:string;

}


interface Brand {

_id:string;
name:string;

}



interface ProductFormProps {

onSuccess:()=>void;

}



export default function ProductForm({
onSuccess
}:ProductFormProps){



const [categories,setCategories]=useState<Category[]>([]);
const [brands,setBrands]=useState<Brand[]>([]);



const [form,setForm]=useState({

name:"",
description:"",
price:"",
images:"",
category:"",
brand:"",
stock:"",
isActive:true

});





useEffect(()=>{


async function loadData(){


const categoriesResponse =
await fetch("/api/categories");


const brandsResponse =
await fetch("/api/brands");



const categoriesData =
await categoriesResponse.json();


const brandsData =
await brandsResponse.json();



setCategories(categoriesData);

setBrands(brandsData);



}


loadData();



},[]);





function handleChange(
e:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
){


const {name,value}=e.target;



setForm(prev=>({

...prev,

[name]:value

}));



}






async function handleSubmit(
e:React.FormEvent
){


e.preventDefault();



const response =
await fetch("/api/products",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name:form.name,

description:form.description,

price:Number(form.price),

images:[
form.images
],

category:form.category,

brand:form.brand,

stock:Number(form.stock),

isActive:form.isActive

})

});




if(response.ok){

onSuccess();

}



}





return (

<form
onSubmit={handleSubmit}
className="space-y-4"
>



<input

name="name"

placeholder="Nom du produit"

className="border p-3 rounded w-full"

value={form.name}

onChange={handleChange}

/>




<textarea

name="description"

placeholder="Description"

className="border p-3 rounded w-full"

value={form.description}

onChange={handleChange}

/>





<input

name="price"

type="number"

placeholder="Prix TND"

className="border p-3 rounded w-full"

value={form.price}

onChange={handleChange}

/>





<input

name="images"

placeholder="Image URL"

className="border p-3 rounded w-full"

value={form.images}

onChange={handleChange}

/>





<select

name="category"

className="border p-3 rounded w-full"

value={form.category}

onChange={handleChange}

>


<option value="">

Choisir catégorie

</option>


{
categories.map(category=>(

<option
key={category._id}
value={category._id}
>

{category.name}

</option>

))
}


</select>





<select

name="brand"

className="border p-3 rounded w-full"

value={form.brand}

onChange={handleChange}

>


<option value="">

Choisir marque

</option>


{
brands.map(brand=>(

<option
key={brand._id}
value={brand._id}
>

{brand.name}

</option>

))
}


</select>






<input

name="stock"

type="number"

placeholder="Stock"

className="border p-3 rounded w-full"

value={form.stock}

onChange={handleChange}

/>





<button

className="
bg-[#7C8B73]
text-white
px-6
py-3
rounded-full
"

>

Créer le produit

</button>




</form>

)

}
