import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { ReactNode } from "react";
import type { LinksFunction } from "react-router";
import "./app.css";
import { AuthProvider } from "./contexts/authContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useLocation } from "react-router";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Store</title>
      <Meta />
      <Links />
    </head>
    <body>
    {children}
    <ScrollRestoration />
    <Scripts />
    </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <AuthProvider>
      {isLoginPage ? (
        <Outlet />
      ) : (
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}