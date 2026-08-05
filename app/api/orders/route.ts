import {NextRequest} from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import "@/models/Product";




// CREATE ORDER

export async function POST(
request:NextRequest
){


try{


await connectDB();


const body =
await request.json();



const order =
await Order.create(body);



return Response.json(
order,
{
status:201
}
);



}catch(error){


console.error(
"CREATE ORDER ERROR:",
error
);



return Response.json(
{
error:"Failed to create order"
},
{
status:500
}
);


}

}





// GET ALL ORDERS

export async function GET(){


try{


await connectDB();



const orders =
await Order
.find()
.populate({
path:"products.product",
select:"name images"
})
.sort({
createdAt:-1
});



return Response.json(
orders
);



}catch(error){


console.error(
"GET ORDERS ERROR:",
error
);



return Response.json(
{
error:"Failed to fetch orders"
},
{
status:500
}
);


}

}