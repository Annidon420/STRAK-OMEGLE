import "./globals.css";

import { Toaster } from "react-hot-toast";

import Providers from "./providers";

export const metadata = {
  title: "STRAK",
  description: "Modern Video Chat Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>

        <Toaster position="top-right" />

        <Providers>{children}</Providers>

      </body>
    </html>
  );
}