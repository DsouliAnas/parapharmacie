import WishlistCard from "@/components/WishlistCard";
import { cookies } from "next/headers";


interface WishlistItem {

_id:string;

product:{

_id:string;

name:string;

price:number;

images:string[];

};

}



async function getWishlist(){


const cookieStore = await cookies();


const res =
await fetch(
"http://localhost:3000/api/wishlist",
{

headers:{

Cookie:
cookieStore
.toString()

},

cache:"no-store"

}

);



if(!res.ok){

return [];

}



return res.json();


}




export default async function WishlistPage(){


const wishlist:WishlistItem[] =
await getWishlist();



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
mb-8
"
>

My Wishlist ❤️

</h1>




{
wishlist.length === 0 ?


<p>

Votre wishlist est vide

</p>



:


<div
className="
grid
md:grid-cols-4
gap-6
"
>


{
wishlist.map((item)=>(


<WishlistCard

key={item._id}

item={item}

/>


))

}



</div>


}



</main>

);


}