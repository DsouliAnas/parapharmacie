"use client";

import {useState} from "react";


interface Category{

_id:string;

name:string;

image?:string;

}



interface EditCategoryFormProps{

category:Category;

onSuccess:()=>void;

}




export default function EditCategoryForm({
category,
onSuccess
}:EditCategoryFormProps){



const [name,setName]=useState(category.name);

const [image,setImage]=useState(category.image || "");






async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();



const response =
await fetch(
`/api/categories/${category._id}`,
{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

name,

image

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

value={name}

onChange={(e)=>setName(e.target.value)}

className="
border
p-3
rounded
w-full
"

placeholder="Nom catégorie"

/>





<input

value={image}

onChange={(e)=>setImage(e.target.value)}

className="
border
p-3
rounded
w-full
"

placeholder="Image URL"

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

Sauvegarder

</button>



</form>

)

}