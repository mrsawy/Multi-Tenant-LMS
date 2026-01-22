"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/dropdown-menu"
import { Button } from "./button"


interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [])

  useEffect(() => {
    const updateTheme = () => {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      const shouldBeDark = theme === "dark" || (theme === "system" && isSystemDark)
      setIsDark(shouldBeDark)

      if (shouldBeDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleSystemThemeChange = () => {
      if (theme === "system") {
        updateTheme()
      }
    }
    mediaQuery.addEventListener("change", handleSystemThemeChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [theme])

  const applyThemeWithAnimation = useCallback(async (newTheme: "light" | "dark" | "system") => {
    if (!buttonRef.current) return

    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = newTheme === "dark" || (newTheme === "system" && isSystemDark)
    const willChange = isDark !== shouldBeDark

    if (!willChange && theme === newTheme) return

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(newTheme)
        setIsDark(shouldBeDark)
        localStorage.setItem("theme", newTheme)

        if (shouldBeDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      })
    }).ready

    if (willChange) {
      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    }
  }, [isDark, duration, theme])

  const handleThemeChange = useCallback((newTheme: "light" | "dark" | "system") => {
    applyThemeWithAnimation(newTheme)
  }, [applyThemeWithAnimation])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <Button variant="outline" size="icon" ref={buttonRef} {...props}>
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
