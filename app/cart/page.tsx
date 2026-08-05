"use client";


import {useCart} from "@/components/CartProvider";
import Link from "next/link";



export default function CartPage(){


const {
cart,
removeFromCart,
increaseQuantity,
decreaseQuantity
}=useCart();





const subtotal = cart.reduce(
(sum,item)=>
sum + item.price * item.quantity,
0
);



const delivery = cart.length > 0 ? 7 : 0;


const total = subtotal + delivery;






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

Mon panier

</h1>






{
cart.length === 0

?

<div
className="
bg-white
rounded-2xl
p-10
text-center
shadow
"
>


<p className="
text-xl
"
>

Votre panier est vide

</p>



<Link

href="/"

className="
inline-block
mt-6
bg-[#7C8B73]
text-white
px-6
py-3
rounded-full
"

>

Continuer mes achats

</Link>


</div>



:



<div
className="
bg-white
rounded-2xl
p-8
shadow
"
>






{
cart.map((item)=>(


<div

key={item._id}

className="
flex
justify-between
items-center
border-b
py-6
"

>




<div
className="
flex
gap-5
items-center
"
>


<img

src={item.image}

alt={item.name}

className="
w-24
h-24
rounded-xl
object-cover
"

/>





<div>


<h3
className="
font-bold
text-lg
"
>

{item.name}

</h3>



<p className="
text-[#7C8B73]
font-semibold
"
>

{item.price} TND

</p>






<div
className="
flex
items-center
gap-3
mt-3
"
>


<button

onClick={()=>decreaseQuantity(item._id)}

className="
w-8
h-8
rounded-full
bg-[#F8F3EA]
"

>

-

</button>





<span
className="
font-bold
"
>

{item.quantity}

</span>





<button

onClick={()=>increaseQuantity(item._id)}

className="
w-8
h-8
rounded-full
bg-[#7C8B73]
text-white
"

>

+

</button>




</div>



</div>


</div>







<button

onClick={()=>removeFromCart(item._id)}

className="
text-red-500
hover:text-red-700
"

>

Supprimer

</button>






</div>


))

}







<div
className="
mt-8
space-y-3
text-lg
"
>


<div className="
flex
justify-between
"
>

<span>
Sous-total
</span>


<span>
{subtotal} TND
</span>

</div>





<div className="
flex
justify-between
"
>

<span>
Livraison
</span>


<span>
{delivery} TND
</span>

</div>





<div className="
border-t
pt-4
flex
justify-between
font-bold
text-xl
"
>

<span>
Total
</span>


<span>
{total} TND
</span>


</div>



</div>







<Link

href="/checkout"

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

Passer la commande

</Link>







</div>

}



</main>

)

}