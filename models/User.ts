import {Schema, models, model} from "mongoose";


const UserSchema = new Schema(

{


name:{

type:String,

required:true

},



email:{

type:String,

required:true,

unique:true

},



password:{

type:String,

required:true

},




role:{


type:String,


enum:[

"customer",

"admin"

],


default:"customer"


},




phone:{


type:String

},




address:{


type:String

},




city:{


type:String

},




postalCode:{


type:String

}



},


{

timestamps:true

}


);




const User =
models.User ||
model(
"User",
UserSchema
);



export default User;