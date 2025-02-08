import Head from "next/head";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        <meta name="google-site-verification" content="dsbwhtt6cUATwNVMKBbR2YKlZZev4zM1qOndSggpjqM" />
      </Head>
      <body>
        {children}
      </body>
    </html>
  );
}
