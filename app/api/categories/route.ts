import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";


// GET ALL CATEGORIES

export async function GET(){

try{

await connectDB();


const categories = await Category.find();


return Response.json(categories);


}catch(error){

return Response.json(
{
error:"Failed to fetch categories"
},
{
status:500
}
);

}

}



// CREATE CATEGORY

export async function POST(
request:NextRequest
){

try{

await connectDB();


const body = await request.json();


const category = await Category.create(body);


return Response.json(
category,
{
status:201
}
);


}catch(error){

return Response.json(
{
error:"Failed to create category"
},
{
status:500
}
);

}

}