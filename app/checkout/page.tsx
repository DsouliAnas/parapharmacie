"use client";

import {useState} from "react";
import {useCart} from "@/components/CartProvider";
import {useRouter} from "next/navigation";


export default function CheckoutPage(){


const {cart,clearCart}=useCart();


const router=useRouter();



const [loading,setLoading]=useState(false);



const [form,setForm]=useState({

name:"",
email:"",
phone:"",
backupPhone:"",
address:""

});



const deliveryFee=7;



const subtotal =
cart.reduce(
(total,item)=>
total +
(item.price * item.quantity),
0
);



const total =
subtotal + deliveryFee;





function handleChange(
e:React.ChangeEvent<HTMLInputElement>
){

setForm({

...form,

[e.target.name]:
e.target.value

});

}






async function placeOrder(){



if(!form.name || !form.phone || !form.address){

alert(
"Veuillez remplir les champs obligatoires"
);

return;

}



if(cart.length===0){

alert(
"Votre panier est vide"
);

return;

}



setLoading(true);



const orderData={


customerName:
form.name,


customerEmail:
form.email,


phone:
form.phone,


backupPhone:
form.backupPhone,


address:
form.address,



products:

cart.map(item=>({

product:item._id,

quantity:item.quantity,

price:item.price

})),



totalPrice:total,


paymentMethod:
"Cash on Delivery",


status:
"Pending"


};




const response =
await fetch(
"/api/orders",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:
JSON.stringify(orderData)

}

);




if(response.ok){


const order =
await response.json();



clearCart();



router.push(
`/order-success?id=${order._id}`
);


}
else{


alert(
"Erreur lors de la commande"
);


}



setLoading(false);


}






return (

<main className="
min-h-screen
bg-[#F8F3EA]
p-10
">


<h1 className="
text-4xl
font-bold
text-[#7C8B73]
mb-10
">

Finaliser votre commande

</h1>




<div className="
grid
md:grid-cols-2
gap-10
">



{/* FORM */}


<div className="
bg-white
rounded-2xl
p-8
shadow
">


<h2 className="
text-2xl
font-bold
mb-5
">

Informations livraison

</h2>



<input
name="name"
placeholder="Nom *"
value={form.name}
onChange={handleChange}
className="input"
/>



<input
name="email"
placeholder="Email"
value={form.email}
onChange={handleChange}
className="input"
/>



<input
name="phone"
placeholder="Téléphone *"
value={form.phone}
onChange={handleChange}
className="input"
/>



<input
name="backupPhone"
placeholder="Téléphone secondaire"
value={form.backupPhone}
onChange={handleChange}
className="input"
/>



<input
name="address"
placeholder="Adresse *"
value={form.address}
onChange={handleChange}
className="input"
/>



</div>






{/* SUMMARY */}



<div className="
bg-white
rounded-2xl
p-8
shadow
">


<h2 className="
text-2xl
font-bold
mb-5
">

Résumé

</h2>



{
cart.map(item=>(

<div
key={item._id}
className="
flex
justify-between
mb-3
"
>

<span>
{item.name}
x {item.quantity}
</span>

<span>
{item.price * item.quantity} TND
</span>


</div>


))
}



<hr className="my-5"/>



<div className="flex justify-between">

<span>
Sous-total
</span>

<span>
{subtotal} TND
</span>


</div>



<div className="flex justify-between">

<span>
Livraison
</span>

<span>
{deliveryFee} TND
</span>


</div>



<div className="
flex
justify-between
font-bold
text-xl
mt-5
">

<span>
Total
</span>

<span>
{total} TND
</span>


</div>




<button

onClick={placeOrder}

disabled={loading}

className="
mt-8
w-full
bg-[#7C8B73]
text-white
py-3
rounded-full
"

>


{
loading
?
"Traitement..."
:
"Commander"
}


</button>



</div>


</div>


</main>

)

}