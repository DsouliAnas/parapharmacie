"use client";


import {useState} from "react";
import {useSession} from "next-auth/react";


interface ReviewFormProps{

productId:string;

}



export default function ReviewForm({
productId
}:ReviewFormProps){


const {data:session}=useSession();


const [rating,setRating]=useState(5);

const [comment,setComment]=useState("");

const [loading,setLoading]=useState(false);



async function submitReview(){


if(!session?.user?.id){

alert("Vous devez être connecté pour laisser un avis");

return;

}



if(!comment.trim()){

alert("Écrivez un commentaire");

return;

}



setLoading(true);



const res =
await fetch(
"/api/reviews",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

product:productId,

user:session.user.id,

name:session.user.name,

rating,

comment

})


}

);



const data =
await res.json();



if(res.ok){

alert("Avis ajouté");

setComment("");

window.location.reload();

}
else{

alert(
data.error || "Erreur"
);

}



setLoading(false);


}




return (

<div
className="
bg-white
rounded-2xl
p-6
mt-8
shadow
"
>


<h3
className="
text-xl
font-bold
mb-4
"
>

Donner votre avis

</h3>



<div
className="
flex
gap-2
mb-4
"
>


{

[1,2,3,4,5].map(star=>(


<button

key={star}

type="button"

onClick={()=>setRating(star)}

className="text-2xl"

>


<span
className={
star <= rating
?
"text-yellow-500"
:
"text-gray-300"
}
>

★

</span>


</button>


))

}


</div>





<textarea

value={comment}

onChange={
e=>setComment(e.target.value)
}

placeholder="Votre commentaire..."

className="
w-full
border
rounded-xl
p-3
h-32
"

/>




<button

onClick={submitReview}

disabled={loading}

className="
mt-4
bg-[#7C8B73]
text-white
px-6
py-3
rounded-full
"

>

{

loading
?
"Envoi..."
:
"Publier"

}


</button>



</div>

);


}