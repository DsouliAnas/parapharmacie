"use client";

import {useState} from "react";


interface BrandFormProps{

onSuccess:()=>void;

}


export default function BrandForm({
onSuccess
}:BrandFormProps){


const [name,setName]=useState("");

const [logo,setLogo]=useState("");



async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();


const response =
await fetch(
"/api/brands",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
logo
})
}
);



if(response.ok){

setName("");

setLogo("");

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

placeholder="Nom de la marque"

className="
border
p-3
rounded
w-full
"

/>



<input

value={logo}

onChange={(e)=>setLogo(e.target.value)}

placeholder="Logo URL"

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

Ajouter

</button>


</form>

)

}