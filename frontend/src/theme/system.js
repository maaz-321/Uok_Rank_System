import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/**
 * University of Karachi brand palette.
 * Every palette is a full 50 -> 950 scale so that it can be used with the
 * Chakra v3 `colorPalette` prop (Button, Badge, Alert, Tag, ...).
 */
const brandTokens = {
  colors: {
    maroon: {
      50: { value: "#fdf4f4" },
      100: { value: "#fbe7e7" },
      200: { value: "#f6d2d2" },
      300: { value: "#eeb1b1" },
      400: { value: "#df8181" },
      500: { value: "#c94f4f" },
      600: { value: "#a93333" },
      700: { value: "#8a2525" },
      800: { value: "#800000" },
      900: { value: "#660000" },
      950: { value: "#3a0000" },
    },
    gold: {
      50: { value: "#fdfaef" },
      100: { value: "#faf1d3" },
      200: { value: "#f3e0a5" },
      300: { value: "#e9c96f" },
      400: { value: "#dfb649" },
      500: { value: "#d4af37" },
      600: { value: "#b18e26" },
      700: { value: "#86691d" },
      800: { value: "#6a5219" },
      900: { value: "#584419" },
      950: { value: "#31240a" },
    },
    navy: {
      50: { value: "#eef2f7" },
      100: { value: "#d6dfeb" },
      200: { value: "#b0c1d9" },
      300: { value: "#809ec2" },
      400: { value: "#4f76a8" },
      500: { value: "#2d568c" },
      600: { value: "#234377" },
      700: { value: "#1a365d" },
      800: { value: "#152a47" },
      900: { value: "#101d30" },
      950: { value: "#070d18" },
    },
  },
  fonts: {
    heading: {
      value:
        "'Plus Jakarta Sans', 'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    },
    body: {
      value:
        "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  },
  radii: {
    l1: { value: "var(--chakra-radii-xs)" },
    l2: { value: "var(--chakra-radii-sm)" },
    l3: { value: "var(--chakra-radii-md)" },
  },
  shadows: {
    outline: {
      value:
        "0 0 0 1px color-mix(in srgb, var(--chakra-colors-maroon-500) 22%, transparent)",
    },
  },
};

/**
 * Semantic tokens turn a raw palette into a full "colorPalette" contract.
 * `solid` / `contrast` drive filled buttons, `fg` / `subtle` / `muted` drive
 * text + soft surfaces, `focusRing` drives keyboard focus states.
 */
const brandSemanticTokens = {
  colors: {
    maroon: {
      contrast: { value: { _light: "{colors.white}", _dark: "{colors.white}" } },
      fg: { value: { _light: "{colors.maroon.700}", _dark: "{colors.maroon.300}" } },
      subtle: {
        value: { _light: "{colors.maroon.50}", _dark: "{colors.maroon.950}" },
      },
      muted: {
        value: { _light: "{colors.maroon.100}", _dark: "{colors.maroon.900}" },
      },
      emphasized: {
        value: { _light: "{colors.maroon.200}", _dark: "{colors.maroon.800}" },
      },
      solid: { value: "{colors.maroon.800}" },
      focusRing: { value: "{colors.maroon.500}" },
      border: {
        value: { _light: "{colors.maroon.200}", _dark: "{colors.maroon.800}" },
      },
    },
    gold: {
      contrast: { value: { _light: "{colors.gold.950}", _dark: "{colors.gold.950}" } },
      fg: { value: { _light: "{colors.gold.700}", _dark: "{colors.gold.300}" } },
      subtle: { value: { _light: "{colors.gold.50}", _dark: "{colors.gold.950}" } },
      muted: { value: { _light: "{colors.gold.100}", _dark: "{colors.gold.900}" } },
      emphasized: {
        value: { _light: "{colors.gold.200}", _dark: "{colors.gold.800}" },
      },
      solid: { value: "{colors.gold.500}" },
      focusRing: { value: "{colors.gold.500}" },
      border: {
        value: { _light: "{colors.gold.200}", _dark: "{colors.gold.800}" },
      },
    },
    navy: {
      contrast: { value: { _light: "{colors.white}", _dark: "{colors.white}" } },
      fg: { value: { _light: "{colors.navy.700}", _dark: "{colors.navy.300}" } },
      subtle: { value: { _light: "{colors.navy.50}", _dark: "{colors.navy.950}" } },
      muted: { value: { _light: "{colors.navy.100}", _dark: "{colors.navy.900}" } },
      emphasized: {
        value: { _light: "{colors.navy.200}", _dark: "{colors.navy.800}" },
      },
      solid: { value: "{colors.navy.700}" },
      focusRing: { value: "{colors.navy.500}" },
      border: {
        value: { _light: "{colors.navy.200}", _dark: "{colors.navy.800}" },
      },
    },
  },
};

const customConfig = defineConfig({
  theme: {
    tokens: brandTokens,
    semanticTokens: brandSemanticTokens,
  },
  globalCss: {
    "html, body, #root": {
      minHeight: "100dvh",
    },
    body: {
      bg: "bg",
      color: "fg",
    },
    "*::selection": {
      bg: "maroon.solid",
      color: "white",
    },
    "*:focus-visible": {
      outline: "2px solid",
      outlineColor: "maroon.focusRing",
      outlineOffset: "2px",
    },
    "::-webkit-scrollbar": {
      width: "10px",
      height: "10px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      background: "color-mix(in srgb, var(--chakra-colors-maroon-400) 45%, transparent)",
      borderRadius: "999px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "color-mix(in srgb, var(--chakra-colors-maroon-600) 70%, transparent)",
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);

export const BRAND = {
  maroon: "#800000",
  gold: "#d4af37",
  navy: "#1a365d",
};

export default system;
