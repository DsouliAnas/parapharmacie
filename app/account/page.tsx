"use client";


import {useEffect,useState} from "react";



interface User{

name:string;

email:string;

phone?:string;

address?:string;

city?:string;

postalCode?:string;

}



export default function AccountPage(){


const [user,setUser]=useState<User|null>(null);



useEffect(()=>{


fetch("/api/user")

.then(res=>res.json())

.then(data=>setUser(data));


},[]);




if(!user){

return (

<main className="p-10">

<h1 className="text-2xl">

Chargement du compte...

</h1>

</main>

)

}




return (


<main
className="
min-h-screen
bg-[#F8F3EA]
p-10
"
>



<h1
className="
text-4xl
font-bold
text-[#7C8B73]
mb-10
"
>

Mon compte 👋

</h1>




<div
className="
bg-white
rounded-2xl
shadow
p-8
max-w-xl
"
>



<h2
className="
text-2xl
font-bold
mb-5
"
>

Informations personnelles

</h2>



<p>

<b>Nom:</b> {user.name}

</p>



<p>

<b>Email:</b> {user.email}

</p>



<p>

<b>Téléphone:</b> {user.phone || "-"}

</p>



<p>

<b>Adresse:</b> {user.address || "-"}

</p>



<p>

<b>Ville:</b> {user.city || "-"}

</p>



<p>

<b>Code postal:</b> {user.postalCode || "-"}

</p>




</div>



</main>


)

}