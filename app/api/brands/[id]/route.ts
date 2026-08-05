import connectDB from "@/lib/mongodb";
import Brand from "@/models/Brand";
import {NextRequest} from "next/server";




// GET ONE BRAND

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


const brand =
await Brand.findById(id);



if(!brand){

return Response.json(
{
error:"Brand not found"
},
{
status:404
}
);

}



return Response.json(brand);



}catch(error){


return Response.json(
{
error:"Failed to get brand"
},
{
status:500
}
);

}

}






// UPDATE BRAND

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



const brand =
await Brand.findByIdAndUpdate(
id,
body,
{
new:true
}
);



if(!brand){

return Response.json(
{
error:"Brand not found"
},
{
status:404
}
);

}



return Response.json(brand);



}catch(error){


return Response.json(
{
error:"Update failed"
},
{
status:500
}
);

}

}







// DELETE BRAND

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



const brand =
await Brand.findByIdAndDelete(id);



if(!brand){

return Response.json(
{
error:"Brand not found"
},
{
status:404
}
);

}



return Response.json(
{
message:"Brand deleted"
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