import { ThemeProvider as NextThemesProvider } from "next-themes";

/** `.dark` on <html>, following the OS until the user picks a mode. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      // Swap every colour at once instead of each element easing at its own speed
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
