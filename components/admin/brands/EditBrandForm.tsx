"use client";


import {useState} from "react";


interface Brand{

_id:string;

name:string;

logo?:string;

}



interface EditBrandFormProps{

brand:Brand;

onSuccess:()=>void;

}



export default function EditBrandForm({
brand,
onSuccess
}:EditBrandFormProps){



const [name,setName]=useState(brand.name);

const [logo,setLogo]=useState(brand.logo || "");





async function handleSubmit(
e:React.FormEvent
){

e.preventDefault();



const response =
await fetch(
`/api/brands/${brand._id}`,
{
method:"PUT",

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

/>




<input

value={logo}

onChange={(e)=>setLogo(e.target.value)}

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

Modifier

</button>



</form>

)

}