"use client";

import { useState } from "react";


interface AddToWishlistButtonProps {

  productId:string;

}


export default function AddToWishlistButton({
  productId
}:AddToWishlistButtonProps){


const [saved,setSaved]=useState(false);


async function addWishlist(){


try{


const res =
await fetch("/api/wishlist",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

product:productId

})

});



const data =
await res.json();



if(res.ok){

setSaved(true);

}
else{

console.log(data);

}



}catch(error){

console.log(error);

}


}




return (

<button

onClick={addWishlist}

className="
border
px-6
py-3
rounded-full
"

>

{
saved
?
"❤️ Ajouté"
:
"♡ Ajouter aux favoris"
}


</button>

);


}