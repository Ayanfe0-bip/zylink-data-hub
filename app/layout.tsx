import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zylink Data Hub | Connect More. Spend Less.",
  description:
    "Buy mobile data and airtime with ease. Zylink Data Hub makes staying connected simpler.",
  applicationName: "Zylink Data Hub"
};

export const viewport: Viewport = {
  themeColor: "#0756b8",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
