"use client";


import {useRouter} from "next/navigation";
import {useState} from "react";


interface OrderProduct{

product:{
name:string;
images?:string[];
};

quantity:number;

price:number;

}



interface Order{


_id:string;

customerName:string;

customerEmail:string;

phone:string;

backupPhone?:string;

address:string;

products:OrderProduct[];

totalPrice:number;

status:string;


}



interface OrderManagerProps{

orders:Order[];

}



export default function OrderManager({
orders
}:OrderManagerProps){



const router = useRouter();



const [loading,setLoading]=useState(false);





async function updateStatus(
id:string,
status:string
){


setLoading(true);



await fetch(
`/api/orders/${id}`,
{

method:"PATCH",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
status
})

}

);



router.refresh();


setLoading(false);


}







async function deleteOrder(id:string){



const confirmDelete =
window.confirm(
"Supprimer cette commande ?"
);



if(!confirmDelete){
return;
}



await fetch(
`/api/orders/${id}`,
{
method:"DELETE"
}
);



router.refresh();


}





return (

<div>


<h1
className="
text-4xl
font-bold
text-[#7C8B73]
mb-10
"
>

Gestion des commandes

</h1>





<div
className="
space-y-6
"
>



{
orders.map((order)=>(


<div

key={order._id}

className="
bg-white
rounded-2xl
shadow
p-6
"

>



<div
className="
flex
justify-between
items-start
"
>



<div>


<h2
className="
text-xl
font-bold
"
>

{order.customerName}

</h2>



<p>
📞 {order.phone}
</p>


<p>
✉️ {order.customerEmail}
</p>


<p>
📍 {order.address}
</p>


</div>





<div>


<select

value={order.status}

disabled={loading}

onChange={(e)=>
updateStatus(
order._id,
e.target.value
)
}

className="
border
rounded-lg
p-2
"

>


<option>
Pending
</option>

<option>
Processing
</option>

<option>
Shipped
</option>

<option>
Delivered
</option>

<option>
Cancelled
</option>


</select>



</div>


</div>







<hr className="my-5"/>






<h3
className="
font-bold
mb-3
"
>

Produits

</h3>




{
order.products.map(
(item,index)=>(


<div

key={index}

className="
flex
justify-between
border-b
py-2
"

>


<span>

{item.product?.name || "Produit supprimé"}

 x {item.quantity}

</span>


<span>

{item.price * item.quantity} TND

</span>


</div>


)

)

}





<div
className="
mt-5
flex
justify-between
font-bold
text-xl
"
>


<span>
Total
</span>


<span>
{order.totalPrice} TND
</span>


</div>







<button

onClick={()=>
deleteOrder(order._id)
}

className="
mt-5
text-red-500
"

>

🗑 Supprimer

</button>



</div>



))

}



</div>



</div>

)

}