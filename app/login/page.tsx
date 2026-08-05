"use client";


import {signIn} from "next-auth/react";
import {useState} from "react";
import {useRouter} from "next/navigation";



export default function LoginPage(){


const router=useRouter();



const [email,setEmail]=useState("");

const [password,setPassword]=useState("");



async function login(){


const result =
await signIn(
"credentials",
{

email,

password,

redirect:false

}
);



if(result?.ok){

router.push("/");

}
else{

alert(
"Email ou mot de passe incorrect"
);

}


}





return (

<main
className="
min-h-screen
bg-[#F8F3EA]
flex
items-center
justify-center
p-10
"
>


<div
className="
bg-white
p-8
rounded-2xl
shadow
w-full
max-w-md
"
>


<h1
className="
text-3xl
font-bold
text-[#7C8B73]
mb-6
"
>

Connexion

</h1>



<input

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="input"

/>



<input

type="password"

placeholder="Mot de passe"

value={password}

onChange={(e)=>setPassword(e.target.value)}

className="input"

/>




<button

onClick={login}

className="
mt-6
w-full
bg-[#7C8B73]
text-white
py-3
rounded-full
"

>

Se connecter

</button>



</div>


</main>

)

}