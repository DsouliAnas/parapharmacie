"use client";

interface ProductRatingProps {

rating:number;

count:number;

}


export default function ProductRating({
rating,
count
}:ProductRatingProps){


return (

<div className="
flex
items-center
gap-3
">


<div className="
text-yellow-500
text-xl
">

{"★".repeat(Math.round(rating))}
{"☆".repeat(5 - Math.round(rating))}

</div>


<span className="text-gray-600">

{rating.toFixed(1)} ({count} avis)

</span>


</div>

);

}