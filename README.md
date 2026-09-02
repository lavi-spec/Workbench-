# Workbench

A beginner-friendly, single-file React app for practicing **JavaScript**, **Python**, and **database schema design** — built as a "drafting table" themed learning tool.

## What's inside

- **JavaScript Foundations** — variables, functions, arrays, objects, loops
- **Python Foundations** — variables, functions, lists, dictionaries, loops
- **Database Design** — tables, primary keys, foreign keys, plus two hands-on schema-builder exercises
- **Capstone Project** — a small "claims tracker" system that ties all three skills together (unlocks after the three foundation tracks are complete)
- **Live code Sandbox** — write and run real JavaScript (native) and Python (via [Pyodide](https://pyodide.org), a WebAssembly build of CPython)
- **51-term Glossary** — tap any underlined word in a lesson for a plain-language definition, or browse the full searchable glossary page
- **Concept intros** — every lesson opens with a plain-English explanation of the underlying idea before any quiz question
- Progress tracking, XP, and lesson streaks, saved via persistent key-value storage

## Tech

- React (single-file, `.jsx`)
- Tailwind CSS (utility classes)
- [lucide-react](https://lucide.dev) for icons
- [Pyodide](https://pyodide.org) (loaded from CDN) for in-browser Python execution

## Running it

This file was built for and tested inside [Claude.ai Artifacts](https://claude.ai), which provides:
- A React + Tailwind + lucide-react runtime out of the box
- A `window.storage` key-value API used here for saving progress

To run it outside of Claude Artifacts (e.g. in a standalone Vite/Next.js project), you'll need to:
1. Set up a React + Tailwind project
2. Install `lucide-react`
3. Replace the `window.storage` calls in `App` with `localStorage`, a backend, or another persistence layer of your choice

## File

- `practice-workbench.jsx` — the entire app in one file
