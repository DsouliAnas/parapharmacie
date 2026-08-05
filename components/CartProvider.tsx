"use client";


import {
createContext,
useContext,
useState,
useEffect,
ReactNode
} from "react";



interface CartItem {

_id:string;

name:string;

price:number;

image:string;

quantity:number;

}



interface CartContextType {

cart:CartItem[];

addToCart:(item:CartItem)=>void;

removeFromCart:(id:string)=>void;

increaseQuantity:(id:string)=>void;

decreaseQuantity:(id:string)=>void;

clearCart:()=>void;

}



const CartContext =
createContext<CartContextType | undefined>(undefined);





function getInitialCart():CartItem[]{


if(typeof window === "undefined"){

return [];

}



const savedCart =
localStorage.getItem("fairys-cart");



if(!savedCart){

return [];

}



try{

return JSON.parse(savedCart);

}

catch{

return [];

}


}






export default function CartProvider({
children
}:{
children:ReactNode
}){



const [cart,setCart] = useState<CartItem[]>(
getInitialCart
);



const [mounted,setMounted] = useState(false);





useEffect(()=>{

setMounted(true);

},[]);







useEffect(()=>{


if(mounted){

localStorage.setItem(
"fairys-cart",
JSON.stringify(cart)
);

}


},[cart,mounted]);







function addToCart(item:CartItem){



setCart((current)=>{


const existing =
current.find(
(product)=>
product._id===item._id
);





if(existing){


return current.map(
(product)=>

product._id===item._id

?

{
...product,
quantity:
product.quantity + 1
}

:

product

);


}






return [

...current,

{
...item,
quantity:item.quantity || 1
}

];


});



}








function removeFromCart(id:string){


setCart((current)=>

current.filter(
(item)=>
item._id !== id
)

);


}



function increaseQuantity(id:string){


setCart((current)=>

current.map((item)=>

item._id === id

?

{
...item,
quantity:item.quantity + 1
}

:

item

)

);


}





function decreaseQuantity(id:string){


setCart((current)=>

current.map((item)=>

item._id === id && item.quantity > 1

?

{
...item,
quantity:item.quantity - 1
}

:

item

)

);


}



function clearCart(){

setCart([]);

}







return (

<CartContext.Provider

value={{

cart,

addToCart,

removeFromCart,

increaseQuantity,

decreaseQuantity,

clearCart

}}

>

{mounted ? children : null}

</CartContext.Provider>

);



}







export function useCart(){


const context =
useContext(CartContext);



if(!context){

throw new Error(
"useCart must be used inside CartProvider"
);

}



return context;


}