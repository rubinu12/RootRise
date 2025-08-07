**Action:** Create a new file named `README.md` in the root directory of your project. Copy the entire content below and paste it into that file.

```markdown
# UPSC Prelims Practice Platform

## Project Overview

This is a web application designed to help UPSC (Union Public Service Commission) aspirants practice Previous Year Questions (PYQs) for the Prelims exam. The platform features a fully functional quiz engine, a robust user authentication system, and a dedicated admin panel for managing question content.

The primary goal is to provide a clean, efficient, and feature-rich environment for serious exam preparation.

---

## Tech Stack

-   **Framework:** Next.js (App Router)
-   **Language:** TypeScript
-   **Database:** MongoDB with Mongoose
-   **Styling:** Tailwind CSS
-   **Authentication:** Custom implementation using JWT (JSON Web Tokens) stored in secure, httpOnly cookies.

---

## Core Features

-   **Quiz Engine:** A client-side quiz interface that loads questions by subject or year topics. It tracks user answers, time, and generates a report card.
-   **User Authentication:** A secure login/signup system for paid users , non paid users and admins.
-   **Session Management:** A "Magic Key" system is implemented to prevent account sharing by ensuring only one active session is valid per user at any time.
-   **Admin Panel:** A protected, private section (`/admin`) for managing the question bank. Admins can view, create, edit, and delete questions. It's also provide many features like bulk add cuestion in specific format , bulk edit , bulk delete.  
-   **Protected Routes:** Both the user dashboard and the admin panel are protected by server-side checks to prevent unauthorized access.

---

## Project Structure

-   `/app`: Contains all pages and API routes (Next.js App Router).
    -   `/api`: All backend API endpoints.
    -   `/context`: React Context providers for global state management (`AuthContext`, `QuizContext`).
-   `/components`: Reusable React components used across the application.
-   `/lib`: Helper functions and utility code, such as the database connection (`dbConnect.js`) and session validation (`authUtils.tsx`).
-   `/models`: Mongoose schemas that define the structure of the database collections (`User.tsx`, `Question.tsx`, etc.).

---

## Instructions for AI Assistant

**(Please copy and paste this entire section at the beginning of a new chat)**

**AI Prompt:**
"You are an expert senior software developer specializing in the Next.js, TypeScript, and MongoDB stack. I am providing you with the context of my existing project, a UPSC Quiz Application. Your primary role is to assist me in developing new features and fixing bugs while strictly adhering to the established architecture and coding style.

**Key Architectural Principles to Follow:**
1.  **State Management:** All global state is managed via React Context (`AuthContext`, `QuizContext`). Do not introduce other state management libraries unless explicitly asked.
2.  **Authentication:** The authentication system is custom-built using JWTs stored in secure, httpOnly cookies. All protected API routes must be validated using the `validateSession` helper function from `/lib/authUtils.tsx`.
3.  **Database:** The database is MongoDB, and all interactions must go through the Mongoose models defined in the `/models` directory.
4.  **Styling:** All styling is done using Tailwind CSS. Do not write custom CSS in `<style>` tags unless absolutely necessary for a specific, complex animation.
5.  **Code Format:** All new components and models must be written in TypeScript (`.tsx`).

Your task is to analyze my requests, understand the existing code and imagine whole layout and design of site from github repo that i give, and provide complete, production-ready code that seamlessly integrates with this architecture. Always explain your changes and the reasoning behind them."

whenever we start new feature to add first we will discuss all the possible aspact of it. you will give me your suggestions and ask me followup questions to know what's in my mind and after this you wil make whole blueprint first and explain me all stpes in detailed untill this point you don't write single line of code. once every thing finalise we will start development step by step. one step at a time. 
