# Sunnah Foundation Project

This is the codebase for the Sunnah Foundation website.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v20 or later recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/BewideTechnologies/sunnah-foundation
    cd sunnah-foundation
    ```

2.  **Set up environment variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file:
        *   Set `DATABASE_URL` to `postgresql://user:password@localhost:5433/sunnah_foundation` (to match the `docker-compose.yml`).
        *   Generate a strong random string for `SESSION_SECRET`.
        *   Optionally, add your `SENDGRID_API_KEY` if you need email functionality.

3.  **Start the database:**
    *   Run the PostgreSQL container in the background:
        ```bash
        docker-compose up -d
        ```

4.  **Install dependencies:**
    ```bash
    npm install
    ```

5.  **Apply database migrations:**
    *   This command creates the necessary tables in the database based on the schema.
        ```bash
        npm run db:push
        ```

6.  **(Optional) Seed the database:**
    *   Populate the database with initial data (if a seed script exists):
        ```bash
        npm run db:seed
        ```

7.  **Run the development server:**
    *   This starts the backend API and the Vite development server for the frontend.
        ```bash
        npm run dev
        ```
    *   The application should be accessible at `http://localhost:5000`.

## Available Scripts

*   `npm run dev`: Starts the development server (API + Vite).
*   `npm run build`: Builds the frontend and backend for production.
*   `npm run start`: Starts the production server (requires `npm run build` first).
*   `npm run check`: Runs TypeScript checks.
*   `npm run db:push`: Pushes schema changes to the database (development).
*   `npm run db:seed`: Seeds the database with initial data.

## Stopping the Database

*   To stop the PostgreSQL container:
    ```bash
    docker-compose down
    ```
*   To stop and remove the data volume (use with caution!):
    ```bash
    docker-compose down -v
    ```