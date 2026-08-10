"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";


interface WishlistProduct {

  _id:string;

  name:string;

  price:number;

  images:string[];

}



interface WishlistItem {

  _id:string;

  product:WishlistProduct;

}



interface WishlistCardProps {

  readonly item:WishlistItem;

}





export default function WishlistCard({

item

}:WishlistCardProps){


const [removed,setRemoved] = useState(false);

const [loading,setLoading] = useState(false);


const {addToCart} = useCart();





async function remove(){


try{


setLoading(true);



const res =
await fetch(

`/api/wishlist/${item._id}`,

{

method:"DELETE"

}

);



if(res.ok){

setRemoved(true);

}



}

catch(error){

console.log(error);

}

finally{

setLoading(false);

}


}






function addProductToCart(){


addToCart({

_id:item.product._id,

name:item.product.name,

price:item.product.price,

image:item.product.images?.[0] || "",

quantity:1

});


}






if(removed){

return null;

}




return (


<div

className="
bg-white
rounded-xl
p-5
shadow
"

>


<Link

href={`/products/${item.product._id}`}

>


{

item.product.images?.[0] &&

<img

src={item.product.images[0]}

alt={item.product.name}

className="
h-40
w-full
object-cover
rounded-xl
cursor-pointer
"

/>

}



<h3

className="
font-bold
mt-3
hover:text-[#7C8B73]
"

>

{item.product.name}

</h3>


</Link>





<p className="mt-2 font-semibold">

{item.product.price} TND

</p>





<div

className="
flex
gap-3
mt-5
"

>


<button

onClick={addProductToCart}

className="
bg-[#7C8B73]
text-white
px-4
py-2
rounded-full
"

>

Ajouter au panier

</button>





<button

disabled={loading}

onClick={remove}

className="
text-red-500
px-4
py-2
"

>

{

loading

?

"Suppression..."

:

"Supprimer"

}


</button>



</div>



</div>


);


}