"use client";

import {useState} from "react";


interface CategoryFormProps{

onSuccess:()=>void;

}



export default function CategoryForm({
onSuccess
}:CategoryFormProps){


const [name,setName]=useState("");

const [image,setImage]=useState("");





async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();



const response =
await fetch("/api/categories",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name,

image

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

value={name}

onChange={(e)=>setName(e.target.value)}

placeholder="Nom catégorie"

className="
border
p-3
rounded
w-full
"

/>




<input

value={image}

onChange={(e)=>setImage(e.target.value)}

placeholder="Image URL"

className="
border
p-3
rounded
w-full
"

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

Créer catégorie

</button>



</form>

)

}