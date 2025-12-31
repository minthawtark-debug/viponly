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
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

**Note**: `SUPABASE_SECRET_KEY` should be set in Vercel environment variables for production, not in the `.env` file.

## Admin Access System

The application includes a secure admin access system:

- **Admin Authentication**: Full admin users can log in via `/admin/login`
- **Temporary Access Tokens**: Generate one-time use tokens that expire in 1 hour
- **Token Validation**: Tokens are validated server-side and marked as used after access

### API Endpoints

- `POST /api/generate-token`: Generates a new access token
- `GET /api/validate-token?token=<token>`: Validates an access token

### Database Schema

**admin_tokens table**:
- `id`: UUID primary key
- `access_token`: Unique token string
- `user_id`: Optional admin user ID
- `expires_at`: Token expiration timestamp
- `used`: Boolean flag for one-time use
- `created_at`: Creation timestamp

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
