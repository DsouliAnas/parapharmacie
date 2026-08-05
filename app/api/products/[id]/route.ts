import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { NextRequest } from "next/server";



// GET ONE PRODUCT

export async function GET(
request: Request,
context: {
  params: Promise<{
    id: string;
  }>;
}
) {


try {


await connectDB();



const { id } = await context.params;



const product = await Product.findById(id)
.populate("category")
.populate("brand");



if(!product){


return Response.json(
{
error:"Product not found"
},
{
status:404
}
);


}



return Response.json(product);



}catch(error){


return Response.json(
{
error:"Failed to get product"
},
{
status:500
}
);


}


}





// UPDATE PRODUCT

export async function PUT(
request: NextRequest,
context: {
  params: Promise<{
    id:string;
  }>;
}
){


try{


await connectDB();



const {id} = await context.params;



const body = await request.json();



const product =
await Product.findByIdAndUpdate(
id,
body,
{
new:true
}
);



if(!product){


return Response.json(
{
error:"Product not found"
},
{
status:404
}
);


}



return Response.json(product);



}catch(error){


return Response.json(
{
error:"Failed to update product"
},
{
status:500
}
);


}


}





// DELETE PRODUCT

export async function DELETE(
request: Request,
context: {
  params: Promise<{
    id:string;
  }>;
}
){


try{


await connectDB();



const {id} = await context.params;



const product =
await Product.findByIdAndDelete(id);



if(!product){


return Response.json(
{
error:"Product not found"
},
{
status:404
}
);


}



return Response.json(
{
message:"Product deleted"
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