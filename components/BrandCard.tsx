interface BrandCardProps {
  name:string;
}


export default function BrandCard({
  name
}:BrandCardProps){

return (

<div
className="
bg-white
rounded-2xl
p-6
shadow-sm
hover:shadow-md
transition
text-center
"
>

<h3
className="
text-[#7C8B73]
font-semibold
text-lg
"
>

{name}

</h3>


</div>

)

}