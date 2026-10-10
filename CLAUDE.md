# AI Interview Prep Platform

## Project Overview
Full-stack web application for AI-powered interview preparation. 
- Frontend: React with Vite, React Router, Redux Toolkit
- Backend: Node.js/Express with MongoDB, JWT authentication

## Current Status (HEAD: 9722d6c)
- Backend: Authentication middleware created, basic auth routes (register, login, logout) implemented, connected to MongoDB.
- Frontend: Auth pages (Login, Register) designed, routing set up, Redux store initialized for user state.
- Project builds and runs without errors.

## Recently Completed Tasks
- Commit 9722d6c: Created authentication middleware and designed auth pages in frontend.
- Commit c0ad9d7: Created token blacklist schema and added logout controller.
- Commit 74bd225: Connected to database and created authentication routes.
- Commit aa4d14c: Initialized project and started the server.

## Known Issues / Bugs
- None reported at this state. The application is in a working baseline.

## Pending Tasks
- Implement frontend authentication flows (login/register) to interact with backend APIs.
- Protect routes based on authentication status.
- Add user dashboard and interview preparation features.
- Implement error handling and loading states.
- Add API call handling with axios interceptors for auth token.

## Next Steps
- Begin implementing login/register form submissions in frontend.
- Set up axios instance with base URL and interceptors for attaching auth token.
- Create private routes component for protected pages.