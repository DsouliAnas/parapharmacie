"use client";


import Link from "next/link";
import {useSearchParams} from "next/navigation";



export default function OrderSuccessPage(){


const searchParams = useSearchParams();


const id =
searchParams.get("id");



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
rounded-2xl
shadow
p-10
text-center
max-w-lg
"
>


<h1
className="
text-4xl
font-bold
text-[#7C8B73]
mb-5
"
>

Commande confirmée 🎉

</h1>



<p className="text-lg">

Merci pour votre commande.

</p>



<p className="mt-3 text-gray-600">

Votre numéro de commande :

</p>



<p
className="
font-bold
mt-2
break-all
"
>

{id}

</p>




<Link

href="/"

className="
inline-block
mt-8
bg-[#7C8B73]
text-white
px-8
py-3
rounded-full
"

>

Retour à laccueil

</Link>



</div>


</main>

)

}