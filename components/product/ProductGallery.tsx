"use client";


import {useState} from "react";


interface ProductGalleryProps {

images?: string[];

}



export default function ProductGallery({

images = []

}:ProductGalleryProps){



const validImages =
images.filter(
(image)=>image && image.trim() !== ""
);



const [selectedImage,setSelectedImage] =
useState<string | null>(
validImages[0] || null
);





if(validImages.length === 0){


return (

<div
className="
bg-white
rounded-2xl
p-10
text-center
"
>

Aucune image disponible

</div>

);


}






return (

<div>



<img

src={selectedImage || undefined}

alt="Product"

className="
w-full
h-[500px]
object-cover
rounded-2xl
border
"

/>






<div
className="
flex
gap-3
mt-4
"
>


{

validImages.map((image,index)=>(


<img

key={index}

src={image}

alt="thumbnail"

onClick={()=>setSelectedImage(image)}

className="
w-20
h-20
object-cover
rounded-lg
border
cursor-pointer
"

/>


))


}



</div>



</div>


);


}