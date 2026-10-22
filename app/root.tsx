import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router";
import type { Route } from "./+types/root";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "./app.css";
import { SITE } from "./lib/site";

export const links: Route.LinksFunction = () => [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }];

const ld = [
  { "@context": "https://schema.org", "@type": "Organization", name: "Sela (design concept)", url: SITE.url, description: "Sela is a fictional smart ring: a design concept by Nova Digital Studio. Not a real product or a medical device.", creator: { "@type": "Organization", name: "Nova Digital Studio" } },
  { "@context": "https://schema.org", "@type": "WebSite", name: "Sela (concept)", url: SITE.url },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F4EFE9" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <Meta />
        <Links />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const msg = isRouteErrorResponse(error) && error.status === 404 ? "404" : "Something went wrong";
  return (
    <main id="main" className="site section-pad">
      <h1 className="text-h2">{msg}</h1>
      <a className="mt-8 inline-block underline" href="/">Back to Sela</a>
    </main>
  );
}
