import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";



// GET ALL BRANDS

export async function GET(){

try{

await connectDB();


const brands = await Brand.find();


return Response.json(brands);


}catch(error){

return Response.json(
{
error:"Failed to fetch brands"
},
{
status:500
}
);

}

}




// CREATE BRAND

export async function POST(
request:NextRequest
){

try{

await connectDB();


const body = await request.json();


const brand = await Brand.create(body);


return Response.json(
brand,
{
status:201
}
);


}catch(error){

return Response.json(
{
error:"Failed to create brand"
},
{
status:500
}
);

}

}