import {NextRequest} from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";



// GET ONE ORDER

export async function GET(
request:Request,
context:{
params:Promise<{
id:string
}>
}
){

try{


await connectDB();


const {id}=await context.params;



const order =
await Order
.findById(id)
.populate("products.product");



if(!order){

return Response.json(
{
error:"Order not found"
},
{
status:404
}
);

}



return Response.json(order);



}catch(error){


return Response.json(
{
error:"Failed to get order"
},
{
status:500
}
);


}

}





// UPDATE ORDER STATUS

export async function PATCH(
request:NextRequest,
context:{
params:Promise<{
id:string
}>
}
){


try{


await connectDB();



const {id}=await context.params;



const body =
await request.json();



const order =
await Order.findByIdAndUpdate(

id,

{
status:body.status
},

{
new:true
}

);



return Response.json(order);



}catch(error){


return Response.json(
{
error:"Failed to update order"
},
{
status:500
}
);


}

}





// DELETE ORDER

export async function DELETE(
request:Request,
context:{
params:Promise<{
id:string
}>
}
){


try{


await connectDB();



const {id}=await context.params;



await Order.findByIdAndDelete(id);



return Response.json(
{
message:"Order deleted"
}
);



}catch(error){


return Response.json(
{
error:"Delete failed"
},
{
status:500
}
);


}

}