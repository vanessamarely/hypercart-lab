# Deployment Guide

This project supports multiple deployment platforms with optimized configurations.

## Vercel Deployment (Recommended)

### Prerequisites
- Node.js 18.x or higher (configured in `.nvmrc`)
- Vercel account

### Automatic Deployment
1. **Import your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite framework

2. **Configuration:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Development Command: `npm run dev`

3. **Environment Variables (if needed):**
   ```
   NODE_ENV=production
   ```

### Manual Deployment via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## GitHub Pages Deployment

### Setup Instructions

1. **Enable GitHub Pages in your repository:**
   - Go to your repository's Settings tab
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Push your code to the main branch:**
   ```bash
   git add .
   git commit -m "Add GitHub Pages deployment workflow"
   git push origin main
   ```

3. **Monitor the deployment:**
   - Go to the "Actions" tab in your repository
   - Watch the "Deploy to GitHub Pages" workflow run
   - Once complete, your site will be available at: `https://[username].github.io/[repository-name]/`

## Build Configuration

The project includes optimized build settings in `vite.config.ts`:

- **Target**: `esnext` for modern browsers
- **Minification**: `esbuild` for fast builds
- **Code Splitting**: Vendor and UI chunks for optimal loading
- **Source Maps**: Disabled in production for smaller bundles

## Troubleshooting

### Vercel Issues
- **Module not found errors**: Ensure `vercel.json` is properly configured
- **Build timeouts**: Check if dependencies are properly listed in `package.json`
- **404 on refresh**: SPA routing is handled by the catch-all route in `vercel.json`

### General Issues
- **Dependencies**: Run `npm install` to ensure all packages are installed
- **TypeScript errors**: Run `npm run build` locally to check for type issues
- **Asset loading**: Verify build output in `dist/` folder

### Local Development

For local development:

```bash
npm install
npm run dev
```

### Production Preview

To test the production build locally:

```bash
npm run build
npm run preview
```