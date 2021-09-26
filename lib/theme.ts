import { createTheme } from "@shopify/restyle";

const palette = {
  black: "#0E2330",
  white: "#FFFFFC",
  darkGrey: "#223948",
  lightGrey: "#F9F9F9",
};

export const lightTheme = createTheme({
  colors: {
    mainBackground: palette.white,
    cardBackground: palette.lightGrey,
    body: palette.black,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 40,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  textVariants: {
    header: {
      fontSize: 22,
      lineHeight: 28,
      color: "body",
    },
  },
});

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    mainBackground: palette.black,
    cardBackground: palette.darkGrey,
    body: palette.white,
  },
};

export type Theme = typeof lightTheme;
