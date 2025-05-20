import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"], //yeah, i speak latin
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],//actually no, just spanish and english saldy
});

export const metadata: Metadata = {
  title: "TaskNotes",
  description: "Write simple", //why not?
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-white">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
