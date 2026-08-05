import {Schema, models, model} from "mongoose";


const OrderSchema = new Schema(

{

customerName:{
type:String,
required:true
},


customerEmail:{
type:String,
required:true
},


phone:{
type:String,
required:true
},


backupPhone:{
type:String
},


address:{
type:String,
required:true
},



products:[

{

product:{

type:Schema.Types.ObjectId,

ref:"Product",

required:true

},


quantity:{

type:Number,

required:true

},


price:{

type:Number,

required:true

}


}

],



totalPrice:{

type:Number,

required:true

},



paymentMethod:{

type:String,

default:"Cash on Delivery"

},



status:{

type:String,

enum:[

"Pending",

"Processing",

"Shipped",

"Delivered",

"Cancelled"

],

default:"Pending"

}


},

{

timestamps:true

}

);



const Order =
models.Order ||
model(
"Order",
OrderSchema
);



export default Order;