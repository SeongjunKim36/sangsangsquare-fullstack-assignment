import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { SkipToContent } from "@/components/skip-to-content";

export const metadata: Metadata = {
  title: "상상단 자기계발 모임",
  description: "상상단 자기계발 모임을 둘러보고 신청할 수 있는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ReactQueryProvider>
            <TooltipProvider>
              <SkipToContent />
              <KeyboardShortcuts />
              {children}
              <Toaster position="bottom-right" richColors />
            </TooltipProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
