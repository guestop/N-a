import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: "swap" 
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-200">
        <AuthProvider>
          <main className="flex-1 w-full max-w-7xl mx-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
