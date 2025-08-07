"use client";

import { Lato, Playfair_Display } from "next/font/google"; // CORRECT: Import Lato and Playfair Display
import "./globals.css";

import { QuizProvider, useQuiz } from "@/app/context/QuizContext";
import { AuthProvider } from "@/app/context/AuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";

// CORRECT: Setup for Lato font (body)
const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});

// CORRECT: Setup for Playfair Display font (headings)
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});

function AppContent({ children }: { children: React.ReactNode }) {
    const { isLoading } = useQuiz();
    return (
        <>
            {isLoading && <LoadingScreen />}
            {children}
        </>
    );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
          <title>Root & Rise</title>
      </head>
      {/* CORRECT: Apply the new font variables to the body */}
      <body className={`${lato.variable} ${playfairDisplay.variable} font-sans antialiased`}>
        <AuthProvider>
          <QuizProvider>
            <AppContent>{children}</AppContent>
          </QuizProvider>
        </AuthProvider>
      </body>
    </html>
  );
}