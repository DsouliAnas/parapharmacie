import {NextRequest} from "next/server";

import {getServerSession} from "next-auth";


import connectDB from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

import Review from "@/models/Review";

import "@/models/Product";

import "@/models/User";




// GET ALL REVIEWS

export async function GET(
request:NextRequest
){


try{


await connectDB();



const {searchParams} =
new URL(request.url);



const productId =
searchParams.get("productId");



const reviews =
await Review.find(
productId
?
{
product:productId
}
:
{}
)
.populate(
"user",
"name email"
)
.sort({
createdAt:-1
});



return Response.json(reviews);



}
catch(error){


console.log(error);


return Response.json(

{
error:"Failed to get reviews"
},

{
status:500
}

);


}

}







// CREATE REVIEW

export async function POST(
request:NextRequest
){


try {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json(
      {
        error: "Vous devez être connecté",
      },
      {
        status: 401,
      }
    );
  }



await connectDB();



const body =
await request.json();



if(
!body.product ||
!body.rating ||
!body.comment
){


return Response.json(

{
error:"Missing fields"
},

{
status:400
}

);


}





const review =
await Review.create({

product:body.product,

user:session.user.id,

name:
session.user.name || "Client",

rating:body.rating,

comment:body.comment

});



return Response.json(

review,

{
status:201
}

);



}
catch(error){


console.log(error);


return Response.json(

{
error:"Failed to create review"
},

{
status:500
}

);


}


}