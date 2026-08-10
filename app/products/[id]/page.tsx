import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";

import ProductRating from "@/components/product/ProductRating";
import ReviewsList from "@/components/product/ReviewsList";
import ReviewForm from "@/components/product/ReviewForm";



interface Product {

_id:string;

name:string;

description:string;

price:number;

discountPrice?:number;

images:string[];

stock:number;

category?:{

_id:string;

name:string;

};


brand?:{

_id:string;

name:string;

};


}



interface Review {

_id:string;

rating:number;

comment:string;

name:string;

}





async function getProduct(id:string):Promise<Product>{


const res =
await fetch(
`http://localhost:3000/api/products/${id}`,
{
cache:"no-store"
}
);



return res.json();


}




async function getReviews(productId:string){

const res =
await fetch(
`http://localhost:3000/api/reviews?productId=${productId}`,
{
cache:"no-store"
}
);


return res.json();

}





async function getProducts(){

const res =
await fetch(
"http://localhost:3000/api/products",
{
cache:"no-store"
}
);


return res.json();

}







export default async function ProductPage({

params

}:{

params:Promise<{id:string}>

}){


const {id}=await params;



const product:Product =
await getProduct(id);



const reviews:Review[] =
await getReviews(id);




const allProducts:Product[] =
await getProducts();





const relatedProducts =
allProducts.filter(
(productItem:Product)=>

productItem.category?._id ===
product.category?._id

&&

productItem._id !== product._id

)
.slice(0,4);






const averageRating =
reviews.length > 0

?

reviews.reduce(

(total:number,review:Review)=>

total + review.rating,

0

)

/

reviews.length


:

0;







return (

<main

className="
min-h-screen
bg-[#F8F3EA]
p-10
"

>




<div

className="
grid
md:grid-cols-2
gap-10
"

>




<ProductGallery

images={product.images}

/>





<ProductInfo

product={product}

/>




</div>







<RelatedProducts

products={relatedProducts}

/>









<section

className="
mt-16
"

>



<h2

className="
text-3xl
font-bold
mb-6
"

>

Avis clients

</h2>







<ProductRating

rating={averageRating}

count={reviews.length}

/>







<ReviewsList

productId={product._id}

/>







<ReviewForm

productId={product._id}

/>







</section>






</main>

);


}