# Nexus Data Catalog

A modern, secure, and intuitive data catalog for discovering, managing, and governing data assets.

[cloudflarebutton]

Nexus Data Catalog is a sophisticated, minimalist web application for discovering, managing, and governing an organization's data assets. It provides a centralized repository for metadata, enabling users to understand data context, quality, and lineage. The platform is built around a robust role-based access control system to ensure data security and appropriate usage.

## Key Features

-   **Dataset Catalog:** A central discovery hub where users can search, filter, and browse all available datasets.
-   **Role-Based Access Control (RBAC):** A four-tier role system (Admin, Data Owner, Contributor, Viewer) dictates user capabilities.
-   **Access Request Workflow:** A formal system for users to request access to private datasets, involving notifications and approvals.
-   **Metadata Management:** Comprehensive tools for Data Owners and Contributors to define and edit dataset metadata.
-   **Audit Trail:** All significant actions within the platform are logged to provide a clear history of data management and access.

## Technology Stack

-   **Frontend:** React, React Router, Zustand, Shadcn/UI, Tailwind CSS, Framer Motion
-   **Backend:** Hono on Cloudflare Workers
-   **Storage:** Cloudflare Durable Objects
-   **Tooling:** Vite, TypeScript, Bun, Zod

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd nexus_data_catalog
    ```

2.  **Install dependencies:**
    ```sh
    bun install
    ```

3.  **Run the development server:**
    The application will be available at `http://localhost:3000`.
    ```sh
    bun run dev
    ```

## Project Structure

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the Hono backend API, entity definitions, and Durable Object logic running on Cloudflare Workers.
-   `shared/`: Contains TypeScript types and mock data shared between the frontend and the backend to ensure type safety.

## Development

-   **Linting:** To check for code quality and style issues, run:
    ```sh
    bun run lint
    ```
-   **Building for Production:** To create a production-ready build of the frontend and worker:
    ```sh
    bun run build
    ```

## Deployment

This project is designed for seamless deployment to Cloudflare.

1.  **Login to Wrangler:**
    ```sh
    wrangler login
    ```

2.  **Deploy the application:**
    This command will build and deploy your application to your Cloudflare account.
    ```sh
    bun run deploy
    ```

Alternatively, you can deploy directly from your GitHub repository.

[cloudflarebutton]

## Role-Permission Matrix

| Permission | Admin | Data Owner | Contributor | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| Create Dataset | Deny | Allow | Deny | Deny |
| Edit Metadata | Deny | Conditional | Conditional | Deny |
| Upload Files | Deny | Conditional | Conditional | Deny |
| Change Visibility | Deny | Conditional | Deny | Deny |
| View All Metadata | Allow | Allow | Allow | Allow |
| Request Access (Private) | N/A | N/A | N/A | Allow |
| Approve/Deny Requests | Allow | Conditional | Deny | Deny |
| Download Public Files | Allow | Allow | Allow | Allow |
| Download Private Files (Approved) | Allow | Allow | Allow | Conditional |
| View Audit Log | Allow | Conditional | Deny | Deny |

## API Endpoints

-   `GET /api/datasets`: List all datasets (with filtering).
-   `GET /api/datasets/:id`: Get detailed metadata for a single dataset.
-   `POST /api/datasets`: Create a new dataset (Data Owner only).
-   `PUT /api/datasets/:id`: Update a dataset's metadata (Data Owner, Contributor).
-   `POST /api/datasets/:id/request-access`: Submit an access request (Viewer).
-   `GET /api/access-requests`: List pending access requests (Admin, Data Owner).
-   `POST /api/access-requests/:reqId/approve`: Approve a request.
-   `POST /api/access-requests/:reqId/deny`: Deny a request.
-   `GET /api/datasets/:id/download`: Get a secure, time-limited URL for a file.