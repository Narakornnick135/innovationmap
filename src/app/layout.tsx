import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "แผนที่นวัตกรรมเพื่อสังคม — adiCET",
  description:
    "แผนที่แสดงนวัตกรรมเพื่อสังคม วิทยาลัยพัฒนาเศรษฐกิจและเทคโนโลยีชุมชนแห่งเอเชีย (adiCET) มหาวิทยาลัยราชภัฏเชียงใหม่",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=Prompt:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
