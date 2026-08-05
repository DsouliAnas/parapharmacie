interface ButtonProps {
  children: React.ReactNode;
  type?: "button" | "submit";
}


export default function Button({
  children,
  type = "button"
}: ButtonProps){

return (

<button
type={type}
className="
bg-[#7C8B73]
text-white
px-8
py-3
rounded-full
hover:bg-[#66745F]
transition
font-medium
"
>

{children}

</button>

)

}