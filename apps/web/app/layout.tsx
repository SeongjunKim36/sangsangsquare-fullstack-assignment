import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { SkipToContent } from "@/components/skip-to-content";

export const metadata: Metadata = {
  title: "상상단 단톡방 모임",
  description: "상상단 단톡방 모임 신청 및 선정 시스템",
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
