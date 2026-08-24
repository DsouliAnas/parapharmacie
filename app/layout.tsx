import type { Metadata } from "next";
import "./globals.css";

import CartProvider from "@/components/CartProvider";
import SessionProvider from "@/components/SessionProvider";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Fairy's Parapharmacie",
  description:
    "Votre parapharmacie en ligne pour vos produits santé et beauté",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>
          <CartProvider>
            <AppShell>
              {children}
            </AppShell>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}