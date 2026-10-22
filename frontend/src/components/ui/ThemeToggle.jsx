import { IconButton } from "@chakra-ui/react";
import { Moon, Sun } from "lucide-react";
import { useColorMode } from "../../providers/ColorModeProvider";

export default function ThemeToggle({ size = "sm", onDark = false }) {
  const { resolvedMode, toggleColorMode } = useColorMode();
  const isDark = resolvedMode === "dark";

  return (
    <IconButton
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      variant="ghost"
      size={size}
      onClick={toggleColorMode}
      css={{
        display: "grid",
        placeItems: "center",
        borderRadius: "var(--chakra-radii-md)",
        color: onDark ? "rgba(255, 255, 255, 0.72)" : "var(--chakra-colors-fg-muted)",
        transition: "background 160ms ease, color 160ms ease, transform 200ms ease",
        _hover: {
          bg: onDark ? "rgba(255, 255, 255, 0.16)" : "var(--chakra-colors-maroon-subtle)",
          color: onDark ? "#ffffff" : "var(--chakra-colors-maroon-fg)",
          transform: "rotate(-12deg)",
        },
      }}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </IconButton>
  );
}
