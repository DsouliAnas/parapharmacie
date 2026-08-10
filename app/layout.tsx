import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import CartProvider from "@/components/CartProvider";
import SessionProvider from "@/components/SessionProvider";


export const metadata: Metadata = {

  title: "Fairy's Parapharmacie",

  description:
    "Votre parapharmacie en ligne pour vos produits santé et beauté",

};



export default function RootLayout({

children,

}: Readonly<{

children: React.ReactNode;

}>) {


return (

<html lang="fr">


<body>


<SessionProvider>


<CartProvider>


<Navbar />


{children}


<Footer />


</CartProvider>


</SessionProvider>


</body>


</html>

);


}