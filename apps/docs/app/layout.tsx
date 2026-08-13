import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ship Faster docs",
  description: "Docs workspace",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
