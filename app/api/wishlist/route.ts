import { NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import Wishlist from "@/models/Wishlist";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import "@/models/Product";


// GET USER WISHLIST

export async function GET() {

  try {

    await connectDB();


    const session = await getServerSession(authOptions);


    if (!session?.user?.id) {

      return Response.json(
        {
          error:"Not authenticated"
        },
        {
          status:401
        }
      );

    }



    const wishlist = await Wishlist.find({
      user: session.user.id
    })
    .populate("product");



    return Response.json(wishlist);



  } catch(error) {


    console.log(error);


    return Response.json(
      {
        error:"Failed to get wishlist"
      },
      {
        status:500
      }
    );


  }

}





// ADD TO WISHLIST

export async function POST(
request:NextRequest
){

try {


await connectDB();


const session =
await getServerSession(authOptions);



if(!session?.user?.id){

return Response.json(
{
error:"Not authenticated"
},
{
status:401
}
);

}



const body =
await request.json();



const exists =
await Wishlist.findOne({

user:session.user.id,

product:body.product

});



if(exists){

return Response.json(
{
message:"Already in wishlist"
}
);

}



const wishlist =
await Wishlist.create({

user:session.user.id,

product:body.product

});



return Response.json(
wishlist,
{
status:201
}
);



}catch(error){

console.log(error);


return Response.json(
{
error:"Failed to add wishlist"
},
{
status:500
}
);

}


}