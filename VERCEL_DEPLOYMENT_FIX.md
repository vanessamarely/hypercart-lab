# Vercel Deployment Fix for Rollup Native Module Error

## Problem Description
Vercel deployment fails with the following error:
```
Error: Cannot find module '/vercel/path0/node_modules/@rollup/rollup-linux-x64-gnu/rollup.linux-x64-gnu.node'
Require stack:
- /vercel/path0/node_modules/rollup/dist/native.js
```

This occurs when Rollup tries to load native modules in Vercel's build environment with Node.js v22.

## Root Cause
- Node.js v22 has compatibility issues with Rollup's native modules in Vercel environment
- The native module resolution fails during the build process
- This is a known issue with newer Node.js versions and native dependencies

## Solutions Applied

### 1. Node.js Version Control
```bash
# .nvmrc
20.17.0

# package.json engines
"engines": {
  "node": ">=18.0.0 <21.0.0"
}

# .env.vercel
NODE_VERSION=20.17.0
```

### 2. Optimized Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2022', // More compatible than 'esnext'
    commonjsOptions: {
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        // Consistent chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
```

### 3. Vercel Configuration
```json
{
  "buildCommand": "npm run build:vercel",
  "installCommand": "npm ci",
  "functions": {
    "app/api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 4. Memory Optimization
```json
{
  "scripts": {
    "build:vercel": "NODE_OPTIONS='--max-old-space-size=4096' npm run build"
  }
}
```

## Alternative Solutions

### Option 1: Use Static Build Without Native Modules
If the above doesn't work, you can disable native optimizations:

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      // Force no native optimizations
      external: ['@rollup/rollup-linux-x64-gnu']
    }
  }
});
```

### Option 2: Use Different Build Command
```json
{
  "buildCommand": "npx vite build --mode production"
}
```

### Option 3: Deploy to Different Platform
Consider using:
- Netlify (better Vite support)
- GitHub Pages (static only)
- Railway or Render

## Verification Steps

1. **Local Build Test:**
   ```bash
   npm run build:vercel
   ```

2. **Check Output:**
   ```bash
   ls -la dist/
   ```

3. **Verify Chunks:**
   - Look for consistent naming patterns
   - Check that all assets are generated

## Troubleshooting

### If Error Persists:
1. Try deleting `node_modules` and `package-lock.json`
2. Use `npm ci` instead of `npm install`
3. Check Vercel's Node.js version in build logs
4. Consider downgrading Vite to v5.x if v6.x continues causing issues

### Environment Variables to Set in Vercel:
```
NODE_VERSION=20.17.0
NODE_ENV=production
NPM_CONFIG_FUND=false
NPM_CONFIG_AUDIT=false
```

## Final Notes
- This issue is temporary and should be resolved in future Rollup/Vite versions
- Node.js v20 LTS is the most stable option for Vercel deployments
- Always test the build locally before deploying