"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ComponentProps, useEffect } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  // Tells the inline failsafe in layout.tsx that the app hydrated, so it stays off.
  useEffect(() => {
    (window as unknown as { __hydrated?: boolean }).__hydrated = true;
  }, []);
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
