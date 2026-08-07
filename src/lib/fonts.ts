import { Young_Serif, Roboto_Flex, Inter } from "next/font/google";

export const youngSerif = Young_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-heading",
});

export const googleSansFlex = Roboto_Flex({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});
