import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast'
import { Layout } from "lucide-react";
import LayoutProvider from "@/layout-provider";

export const metadata: Metadata = {
  title: "Shey Salon & Spa (Dev)",
  description: "Shey Salon & Spa is a salon and spa in the heart of the city.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LayoutProvider>
          {children}
        </LayoutProvider>
        <Toaster />
      </body>
    </html>
  );
}
