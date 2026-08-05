import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { NextRequest } from "next/server";




// GET ONE CATEGORY

export async function GET(
request:Request,
context:{
params:Promise<{
id:string;
}>
}
){


try{


await connectDB();


const {id}=await context.params;



const category =
await Category.findById(id);



if(!category){

return Response.json(
{
error:"Category not found"
},
{
status:404
}
);

}



return Response.json(category);



}catch(error){


return Response.json(
{
error:"Failed to get category"
},
{
status:500
}
);


}

}







// UPDATE CATEGORY

export async function PUT(
request:NextRequest,
context:{
params:Promise<{
id:string;
}>
}
){


try{


await connectDB();


const {id}=await context.params;


const body =
await request.json();



const category =
await Category.findByIdAndUpdate(
id,
body,
{
new:true
}
);



if(!category){

return Response.json(
{
error:"Category not found"
},
{
status:404
}
);

}



return Response.json(category);



}catch(error){


return Response.json(
{
error:"Failed to update category"
},
{
status:500
}
);


}

}







// DELETE CATEGORY

export async function DELETE(
request:Request,
context:{
params:Promise<{
id:string;
}>
}
){


try{


await connectDB();


const {id}=await context.params;



const category =
await Category.findByIdAndDelete(id);



if(!category){

return Response.json(
{
error:"Category not found"
},
{
status:404
}
);

}



return Response.json(
{
message:"Category deleted"
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