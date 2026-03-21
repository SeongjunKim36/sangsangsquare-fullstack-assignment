"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="테마 전환"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5 transition-transform duration-200 hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 transition-transform duration-200 hover:-rotate-12" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{resolvedTheme === "dark" ? "라이트 모드" : "다크 모드"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
