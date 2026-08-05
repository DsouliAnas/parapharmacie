interface CategoryCardProps {
  name:string;
  image:string;
}


export default function CategoryCard({
  name,
  image
}:CategoryCardProps){

return (

<div className="
bg-white
rounded-2xl
p-5
shadow-sm
hover:shadow-md
transition
text-center
">


<img
src={image}
alt={name}
className="
w-full
h-32
object-cover
rounded-xl
"
/>


<h3 className="
mt-4
font-semibold
text-[#7C8B73]
">

{name}

</h3>


</div>

)

}