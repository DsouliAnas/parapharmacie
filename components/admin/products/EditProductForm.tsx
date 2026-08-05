"use client";

import {useEffect, useState} from "react";


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



interface Category {

_id:string;

name:string;

}



interface Brand {

_id:string;

name:string;

}



interface EditProductFormProps {

product:Product;

onSuccess:()=>void;

}




export default function EditProductForm({
product,
onSuccess
}:EditProductFormProps){



const [categories,setCategories]=useState<Category[]>([]);

const [brands,setBrands]=useState<Brand[]>([]);





const [form,setForm]=useState({

name:product.name,

description:product.description,

price:String(product.price),

images:product.images[0] || "",

category:product.category?._id || "",

brand:product.brand?._id || "",

stock:String(product.stock),

isActive:product.isActive

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
e:React.ChangeEvent<
HTMLInputElement |
HTMLTextAreaElement |
HTMLSelectElement
>
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
await fetch(
`/api/products/${product._id}`,
{

method:"PUT",

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

}
);





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

value={form.name}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

placeholder="Nom"

/>





<textarea

name="description"

value={form.description}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

placeholder="Description"

/>





<input

type="number"

name="price"

value={form.price}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

placeholder="Prix"

/>





<input

name="images"

value={form.images}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

placeholder="Image URL"

/>







<select

name="category"

value={form.category}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

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

value={form.brand}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

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

type="number"

name="stock"

value={form.stock}

onChange={handleChange}

className="
border
p-3
rounded
w-full
"

placeholder="Stock"

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

Sauvegarder les modifications

</button>





</form>

)

}