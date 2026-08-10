import Link from "next/link";


interface RelatedProduct {

  _id:string;

  name:string;

  images:string[];

}



interface RelatedProductsProps {

  readonly products:RelatedProduct[];

}



export default function RelatedProducts({

  products,

}:RelatedProductsProps) {


return (

<div className="mt-16">


<h2

className="
text-3xl
font-bold
mb-8
"

>

Vous aimerez aussi

</h2>



<div

className="
grid
md:grid-cols-4
gap-6
"

>


{

products.map((product)=>(


<Link

key={product._id}

href={`/products/${product._id}`}

className="
bg-white
p-4
rounded-xl
shadow
"

>



<img

src={
product.images?.[0] || "/logo1.jpeg"
}

alt={product.name}

className="
w-full
h-48
object-cover
rounded-lg
"

/>



<h3

className="
mt-3
font-bold
"

>

{product.name}

</h3>



</Link>


))


}



</div>



</div>


);


}