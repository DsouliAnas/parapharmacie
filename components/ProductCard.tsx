"use client";


import {useCart} from "@/components/CartProvider";



interface ProductCardProps {

_id:string;

name:string;

price:number;

image:string;

stock:boolean;

}



export default function ProductCard({

_id,

name,

price,

image,

stock

}:ProductCardProps){



const {addToCart}=useCart();




function handleAdd(){

console.log("ADDING TO CART:", {
_id,
name,
price,
image
});


addToCart({

_id,
name,
price,
image,
quantity:1

});


}





return (

<div className="
border
rounded-2xl
p-4
bg-white
shadow-sm
hover:shadow-md
transition
">


<img

src={image}

alt={name}

className="
w-full
h-48
object-cover
rounded-xl
"

/>




<h3 className="
font-semibold
mt-4
">

{name}

</h3>




<p className="
text-[#7C8B73]
font-bold
mt-2
">

{price} TND

</p>




<p
className={
stock
?
"text-green-600"
:
"text-red-500"
}
>

{
stock
?
"En stock"
:
"Rupture de stock"
}

</p>




<button

disabled={!stock}

onClick={handleAdd}

className="
mt-4
w-full
bg-[#7C8B73]
text-white
font-semibold
py-3
px-6
rounded-full
cursor-pointer
hover:bg-[#66745F]
transition
duration-300
disabled:bg-gray-300
disabled:cursor-not-allowed
"

>

Ajouter au panier

</button>



</div>

)

}