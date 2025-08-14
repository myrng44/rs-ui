# 🚀 StoremaN Frontend Application

A modern, production-ready React application built with React Router v7 and Vite, featuring TypeScript, server-side rendering, and seamless API integration.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## ✨ Features

- 🏎️ **React Router v7** - Latest routing capabilities with improved performance
- ⚡️ **Vite** - Lightning fast build tool with HMR
- 🔷 **TypeScript** - Full type safety and developer experience
- 🎨 **TailwindCSS** - Utility-first CSS framework for rapid UI development
- 🚀 **Server-side Rendering (SSR)** - Better SEO and initial load performance
- 🔄 **Hot Module Replacement** - Instant updates during development
- 📦 **Asset Optimization** - Automatic bundling and optimization
- 🔒 **Environment Configuration** - Secure API endpoint management
- 🌐 **API Integration** - Built-in support for both public and secured endpoints

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** or **pnpm**
- Access to the backend API server

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/myrng44/rs-ui.git
   cd rs-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   VITE_API_PUBLIC_URL=/public/rest/v1
   VITE_API_SECURED_URL=/secured/rest/v1
   ```

   > 📝 **Note**: Update the `VITE_API_BASE_URL` to match your backend server URL

## 🚀 Getting Started

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Create an optimized production build:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend server base URL | `http://localhost:8080` |
| `VITE_API_PUBLIC_URL` | Public API endpoints path | `/public/rest/v1` |
| `VITE_API_SECURED_URL` | Secured API endpoints path | `/secured/rest/v1` |

## 📁 Project Structure

```
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── services/       # API service functions
│   └── styles/         # Global styles and Tailwind config
├── build/
│   ├── client/         # Static assets (after build)
│   └── server/         # Server-side code (after build)
├── .env                # Environment variables
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Styling

This project uses [**TailwindCSS**](https://tailwindcss.com/) for styling:

- ✅ Pre-configured and ready to use
- ✅ Custom design system setup
- ✅ Responsive design utilities

You can customize the Tailwind configuration in `tailwind.config.js`.

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t frontend-app .
```

### Run Container

```bash
docker run -p 3000:3000 --env-file .env frontend-app
```

### Deployment Platforms

This containerized application can be deployed to:

- 🌩️ **AWS ECS/Fargate**
- 🔵 **Google Cloud Run**
- 🟦 **Azure Container Apps**
- 🌊 **Digital Ocean App Platform**
- 🪰 **Fly.io**
- 🚂 **Railway**
- 🔺 **Vercel** (with Docker support)
- 📦 **Heroku Container Registry**

## 🔧 API Integration

The application is configured to work with REST APIs through two main endpoints:

### Public Endpoints
```typescript
// Example: Fetch public data
const response = await fetch(`${VITE_API_BASE_URL}${VITE_API_PUBLIC_URL}/data`);
```

### Secured Endpoints
```typescript
// Example: Fetch secured data (requires authentication)
const response = await fetch(`${VITE_API_BASE_URL}${VITE_API_SECURED_URL}/user/profile`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🧪 Development Tips

- **Type Safety**: Leverage TypeScript for better development experience
- **Hot Reload**: Changes are instantly reflected during development
- **DevTools**: React Developer Tools and browser DevTools work seamlessly
- **Performance**: Use React.memo, useMemo, and useCallback for optimization
- **Code Splitting**: Implement lazy loading for better performance

## 📖 Documentation

- [React Router v7 Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built using React Router v7 & Vite**

[⭐ Star this repo](https://github.com/myrng44/rs-ui) • [🐛 Report Bug](https://github.com/myrng44/rs-ui/issues) • [💡 Request Feature](https://github.com/myrng44/rs-ui/issues)

</div>