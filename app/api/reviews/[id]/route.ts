import connectDB from "@/lib/mongodb";

import Review from "@/models/Review";



// DELETE REVIEW

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



await Review.findByIdAndDelete(id);



return Response.json({

message:"Review deleted"

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