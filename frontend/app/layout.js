import "./globals.css";

export const metadata = {
  title: "Network Monitor",
  description: "Networking monitoring dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}