"use client";


import {
useEffect,
useState
} from "react";



interface Review {


_id:string;

name:string;

rating:number;

comment:string;

createdAt?:string;


}




interface ReviewsListProps {

productId:string;

}




export default function ReviewsList({

productId

}:ReviewsListProps){



const [reviews,setReviews]=
useState<Review[]>([]);



const [loading,setLoading]=
useState(true);





useEffect(()=>{


async function loadReviews(){



try{


if(!productId){

setLoading(false);

return;

}



const res =
await fetch(
`/api/reviews?productId=${productId}`,
{
cache:"no-store"
}
);



const data =
await res.json();





if(Array.isArray(data)){

setReviews(data);

}

else{

setReviews([]);

}





}

catch(error){


console.log(
"Reviews error:",
error
);


setReviews([]);


}

finally{


setLoading(false);


}



}



loadReviews();



},[productId]);







if(loading){


return (

<p>
Chargement des avis...
</p>

);


}







if(reviews.length===0){


return (

<p className="
text-gray-500
">

Aucun avis pour ce produit.

</p>


);


}







return (


<div className="
space-y-5
"
>


{

reviews.map((review)=>(


<div

key={review._id}

className="
bg-white
rounded-xl
p-5
shadow
"

>


<div className="
flex
justify-between
items-center
"
>


<h3 className="font-bold">

{review.name}

</h3>



<div className="
text-yellow-500
">


{

"★".repeat(
review.rating
)

}


{

"☆".repeat(
5 - review.rating
)

}


</div>



</div>




<p className="
mt-3
text-gray-700
">

{review.comment}

</p>



</div>


))


}



</div>


);


}