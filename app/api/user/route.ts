import {getServerSession} from "next-auth";

import {
authOptions
} from "@/app/api/auth/[...nextauth]/route";

import connectDB from "@/lib/mongodb";

import User from "@/models/User";





export async function GET(){


try{


const session =
await getServerSession(authOptions);



if(!session?.user?.email){


return Response.json(

{
error:"Not authenticated"
},

{
status:401
}

);


}





await connectDB();





const user =
await User.findOne({

email:session.user.email

})
.select("-password");






if(!user){


return Response.json(

{
error:"User not found"
},

{
status:404
}

);


}







return Response.json(user);



}
catch(error){


console.error(error);



return Response.json(

{
error:"Failed to get user"
},

{
status:500
}

);


}



}