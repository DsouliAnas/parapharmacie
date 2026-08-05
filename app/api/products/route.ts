import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";

import "@/models/Category";
import "@/models/Brand";

import Product from "@/models/Product";


// GET ALL PRODUCTS

export async function GET(){

try{

await connectDB();


const products = await Product
.find()
.populate("category")
.populate("brand");


return Response.json(products);


}catch(error){

console.log(error);

return Response.json(
{
error:"Failed to fetch products",
details:error
},
{
status:500
}
);

}

}



// CREATE PRODUCT

export async function POST(
request:NextRequest
){

try{


await connectDB();


const body = await request.json();


const product = await Product.create(body);


return Response.json(
product,
{
status:201
}
);



}catch(error){


console.log(error);


return Response.json(
{
error:"Failed to create product",
details:error
},
{
status:500
}
);


}

}