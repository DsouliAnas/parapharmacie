"use client";


import { useCart } from "@/components/CartProvider";
import AddToWishlistButton from "./AddToWishlistButton";



interface Product {

_id:string;

name:string;

description:string;

price:number;

discountPrice?:number;

images:string[];

stock:number;


brand?:{

name:string;

};


category?:{

name:string;

};


}



interface ProductInfoProps {

product:Product;

}





export default function ProductInfo({

product,

}:ProductInfoProps) {



const {addToCart}=useCart();




function handleAddToCart(){


addToCart({

_id:product._id,

name:product.name,

price:
product.discountPrice ??
product.price,

image:
product.images?.[0] || "",

quantity:1

});


}





return (


<div>


<h1

className="
text-4xl
font-bold
mb-4
"

>

{product.name}

</h1>





{
product.brand &&

<p className="
text-gray-500
mb-2
">

{product.brand.name}

</p>

}





{
product.category &&

<p className="
text-gray-500
mb-6
">

{product.category.name}

</p>

}







<div className="mb-6">


{

product.discountPrice ?


(

<div className="
flex
gap-3
items-center
">


<span

className="
text-3xl
font-bold
text-[#7C8B73]
"

>

{product.discountPrice} TND

</span>



<span

className="
line-through
text-gray-400
"

>

{product.price} TND

</span>


</div>


)


:


(

<span

className="
text-3xl
font-bold
text-[#7C8B73]
"

>

{product.price} TND

</span>


)

}


</div>







<p className="mb-6">

{product.description}

</p>







<p className="mb-6">


{

product.stock > 0

?

"✅ En stock"

:

"❌ Rupture de stock"

}


</p>








<div className="
flex
gap-4
items-center
">


<button

disabled={product.stock <= 0}

onClick={handleAddToCart}

className="
bg-[#7C8B73]
text-white
px-8
py-3
rounded-full
disabled:bg-gray-300
"

>

Ajouter au panier

</button>





<AddToWishlistButton

productId={product._id}

/>



</div>






</div>


);


}