import { Young_Serif, Google_Sans_Flex, Inter } from "next/font/google";

export const youngSerif = Young_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-heading",
});

export const googleSansFlex = Google_Sans_Flex({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-body",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});
