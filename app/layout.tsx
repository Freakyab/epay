import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { CategoriesProvider } from "@/components/context/category";
import AuthProvider from "./authProvider";
import { Toaster } from "react-hot-toast";
import TopLoader from "@/components/topLoader";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Epay - E-commerce",
  description: "E-commerce website for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          <TopLoader />
          <CategoriesProvider>
            <Toaster />
            {children}
          </CategoriesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
