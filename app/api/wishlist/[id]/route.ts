import connectDB from "@/lib/mongodb";

import Wishlist from "@/models/Wishlist";



export async function DELETE(

request:Request,

context:{
params:Promise<{
id:string
}>
}

){


try{


await connectDB();



const {id}=await context.params;



await Wishlist.findByIdAndDelete(id);



return Response.json({

message:"Removed from wishlist"

});



}
catch(error){


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