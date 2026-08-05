"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";


export default function RegisterPage(){


const router = useRouter();


const [form,setForm]=useState({

name:"",
email:"",
password:"",
phone:"",
address:"",
city:"",
postalCode:""

});


const [loading,setLoading]=useState(false);



function handleChange(
e:React.ChangeEvent<HTMLInputElement>
){

setForm({

...form,

[e.target.name]:
e.target.value

});

}





async function register(){


if(
!form.name ||
!form.email ||
!form.password
){

alert(
"Veuillez remplir les champs obligatoires"
);

return;

}



setLoading(true);



try{


const res =
await fetch(
"/api/register",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:
JSON.stringify(form)

}

);



const data =
await res.json();



if(res.ok){


alert(
"Compte créé avec succès"
);


router.push("/login");


}
else{


alert(
data.error || "Erreur lors de la création du compte"
);


}



}
catch(error){


alert(
"Erreur serveur"
);


}



setLoading(false);


}





return (

<main
className="
min-h-screen
bg-[#F8F3EA]
flex
items-center
justify-center
p-10
"
>


<div
className="
bg-white
rounded-2xl
shadow
p-8
w-full
max-w-md
"
>


<h1
className="
text-3xl
font-bold
text-[#7C8B73]
mb-6
"
>

Créer un compte

</h1>





<input

name="name"

placeholder="Nom *"

value={form.name}

onChange={handleChange}

className="input"

/>




<input

name="email"

placeholder="Email *"

type="email"

value={form.email}

onChange={handleChange}

className="input"

/>




<input

name="password"

placeholder="Mot de passe *"

type="password"

value={form.password}

onChange={handleChange}

className="input"

/>





<hr className="my-5"/>



<p className="text-gray-500 mb-3">

Informations livraison (optionnel)

</p>





<input

name="phone"

placeholder="Téléphone"

value={form.phone}

onChange={handleChange}

className="input"

/>





<input

name="address"

placeholder="Adresse"

value={form.address}

onChange={handleChange}

className="input"

/>





<input

name="city"

placeholder="Ville"

value={form.city}

onChange={handleChange}

className="input"

/>





<input

name="postalCode"

placeholder="Code postal"

value={form.postalCode}

onChange={handleChange}

className="input"

/>







<button

onClick={register}

disabled={loading}

className="
mt-6
w-full
bg-[#7C8B73]
text-white
py-3
rounded-full
"

>


{
loading
?
"Création..."
:
"Créer mon compte"
}


</button>



</div>


</main>

)

}