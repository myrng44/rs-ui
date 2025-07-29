/*
import {isRouteErrorResponse, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration} from 'react-router';
import { useLocation } from 'react-router-dom';

import type {Route} from './+types/root';
import './app.css';
import Navbar from "~/components/navbar";
import ProtectedRoute from "~/components/ProtectedRoute";
import {AuthProvider} from "~/contexts/AuthContext";
import type {ReactNode} from "react";

export const links: Route.LinksFunction = () => [
  {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({children}: { children: ReactNode }) {
  return (
    <html lang='en'>
    <head>
      <meta charSet='utf-8'/>
      <meta name='viewport' content='width=device-width, initial-scale=1'/>
      <Meta/>
      <title>Store maN</title>
      <Links/>
    </head>
    <body>
    <AuthProvider> {/!* Bọc tại đây *!/}
      {children}
    </AuthProvider>
    <ScrollRestoration/>
    <Scripts/>
    </body>
    </html>
  );
}


export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <main className="container mx-auto p-4">
        <Outlet />
      </main>
    </ProtectedRoute>
  );
};


export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
					<code>{stack}</code>
				</pre>
      )}
    </main>
  );
}
*/

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
import ProtectedRoute from "./components/protectedRoute";
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
      <title>Store maN</title>
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
