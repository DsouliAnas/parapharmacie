import mongoose, {Schema, models} from "mongoose";


const ReviewSchema = new Schema(

{

product:{

type:Schema.Types.ObjectId,

ref:"Product",

required:true

},



user:{

type:Schema.Types.ObjectId,

ref:"User",

required:true

},



name:{

type:String,

required:true

},



rating:{

type:Number,

required:true,

min:1,

max:5

},



comment:{

type:String,

required:true

},



isApproved:{

type:Boolean,

default:true

}


},

{

timestamps:true

}

);



const Review =
models.Review ||
mongoose.model(
"Review",
ReviewSchema
);



export default Review;