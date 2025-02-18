import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";

import {    ClerkProvider} from '@clerk/nextjs'
import { Toaster } from "sonner";


const inter = Inter({ subsets: ['latin'] })
export const metadata: Metadata = {
  title: "Wealix",
  description: "One Stop Finance App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>

    <html lang="en">
      <body
        className={` ${inter.className}`}
        >
        {/* {header} */}
        <Header />
        <main className="min-h-screen ">
          {children}
        </main>
        <Toaster richColors/>
        {/* footer */}
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            {/* <p>
              Made with love by <a href="https://github.com/Prakash8999" target="_blank" >Prakash</a>
            </p> */}
          </div>
        </footer>
    </body>
    </html>
        </ClerkProvider>
  );
}
