"use client";


import {
Search,
ShoppingCart,
User
} from "lucide-react";

import CategoryMenu from "./CategoryMenu";

import Link from "next/link";

import {
useSession,
signOut
} from "next-auth/react";



export default function Navbar(){


const {
data:session
}=useSession();




return(


<header className="bg-white border-b">



<div
className="
flex
items-center
justify-between
px-8
py-4
"
>



{/* Logo */}


<Link
href="/"
className="
text-3xl
font-bold
text-pink-500
"
>

Fairys

</Link>





{/* Search */}



<div
className="
flex
items-center
border
rounded-full
px-4
py-2
w-[450px]
"
>


<Search size={20}/>



<input

placeholder="Rechercher un produit, une marque..."

className="
ml-3
outline-none
w-full
"

/>



</div>







{/* Right side */}



<div
className="
flex
items-center
gap-5
"
>




{/* Account */}



{
session

?

<div
className="
relative
group
"
>


<button
className="
flex
items-center
gap-2
"
>

<User size={22}/>

<span>

{session.user?.name}

</span>


</button>




<div
className="
absolute
right-0
top-8
hidden
group-hover:block
bg-white
shadow
rounded-xl
p-4
w-48
z-50
"
>



<Link

href="/account"

className="
block
py-2
"

>

Mon compte

</Link>




<Link

href="/orders"

className="
block
py-2
"

>

Mes commandes

</Link>





<button

onClick={()=>signOut()}

className="
block
py-2
text-red-500
"

>

Déconnexion

</button>



</div>


</div>



:

<Link
href="/login"
className="
flex
items-center
gap-2
"
>

<User size={22}/>

Connexion

</Link>


}







{/* Cart */}



<Link
href="/cart"
className="
relative
"
>


<ShoppingCart
className="cursor-pointer"
/>



</Link>





</div>




</div>





<CategoryMenu/>


</header>


)

}