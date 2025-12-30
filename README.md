# VIP Only

An exclusive VIP access platform built with modern web technologies.

## Project Info

**URL**: https://viponly.vercel.app

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Auth, Database, Storage)

## Development

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd viponly

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_NEXT_PUBLIC_SITE_URL=https://viponly.vercel.app
```

## Deployment

This project is deployed on Vercel. To deploy:

1. Connect your GitHub repository to Vercel
2. Set the environment variables in Vercel dashboard
3. Deploy

## Features

- Admin dashboard for managing members and access links
- Temporary access link generation
- VIP member management
- Secure authentication with Supabase
