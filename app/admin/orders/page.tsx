import OrderManager from "@/components/orders/OrderManager";



async function getOrders(){


const res =
await fetch(
`${process.env.NEXTAUTH_URL}/api/orders`,
{
cache:"no-store"
}
);



if(!res.ok){

throw new Error(
"Failed to fetch orders"
);

}



return res.json();

}





export default async function OrdersPage(){


const orders =
await getOrders();



return (

<main className="
min-h-screen
bg-[#F8F3EA]
p-10
">


<OrderManager
orders={orders}
/>


</main>

)

}