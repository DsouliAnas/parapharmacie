import {NextRequest} from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";



export async function POST(
request:NextRequest
){

try{


const body =
await request.json();



const {
name,
email,
password,
phone,
address,
city,
postalCode
}=body;



if(
!name ||
!email ||
!password
){

return Response.json(
{
error:"Missing required fields"
},
{
status:400
}
);

}



await connectDB();



const existingUser =
await User.findOne({
email:email.toLowerCase()
});



if(existingUser){

return Response.json(
{
error:"Email already exists"
},
{
status:400
}
);

}




const hashedPassword =
await bcrypt.hash(
password,
10
);




const user =
await User.create({

name,

email:
email.toLowerCase(),

password:
hashedPassword,

phone,

address,

city,

postalCode,

role:"customer"

});




return Response.json(
{
message:"User created",
userId:user._id
},
{
status:201
}
);



}
catch(error){


console.error(
"REGISTER ERROR:",
error
);



return Response.json(
{
error:"Server error"
},
{
status:500
}
);


}


}