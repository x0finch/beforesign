/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import * as React from "react";
import { DefaultCatchBoundary } from "~/components/default_catch_boundary.tsx";
import { NotFound } from "~/components/not_found.tsx";
import { ThemeProvider } from "~/components/layout/theme_provider.tsx";
import { TooltipProvider } from "@beforesign/ui/tooltip";
import appCss from "~/styles/app.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('beforesign-theme');var d=document.documentElement;if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches))d.classList.add('dark');else d.classList.remove('dark');}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BeforeSign" },
      {
        name: "description",
        content: "Understand on-chain transactions before you sign",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @typescript-eslint/naming-convention -- React DOM API */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="bg-background text-foreground antialiased">
        <ThemeProvider>
          <TooltipProvider delay={0}>
            <div className="mx-auto max-w-3xl min-h-screen px-4 pb-16">{children}</div>
          </TooltipProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
