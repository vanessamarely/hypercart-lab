# HyperCart Lab - Performance Debugging Demo

A production-ready React + TypeScript demo application designed for Chrome DevTools performance debugging conference talks. Features toggleable performance issues for live demonstrations of Core Web Vitals optimization techniques.

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd hypercart-lab-chrome
npm install

# Start development server
npm run dev

# Open app with debug panel
http://localhost:5173/?debug=1

# Build for production
npm run build

# Serve production build
npm run preview
```

## Configuration

### Local Asset Management

The app uses local images stored in `/src/assets/images/` for reliable offline performance:
- Product images: `product-1.webp` through `product-6.webp`
- Hero images: `hero.webp`, `hero-2x.webp` 
- No external API dependencies for demo reliability

## Debug Panel Access

- **Development**: Debug panel automatically visible
- **Production**: Add `?debug=1` to URL to show debug panel
- **Toggle Count**: Badge shows number of active performance flags

## Routes & Performance Labs

### 🏠 Home Page (`/`) - LCP/CLS Lab
**Focus**: Largest Contentful Paint & Cumulative Layout Shift optimization

**Available Toggles**:
- `heroPreload`: Preload hero image for faster LCP
- `heroFetchPriorityHigh`: Use `fetchpriority="high"` attribute
- `fontPreconnect`: Preconnect to Google Fonts
- `reserveHeroSpace`: Reserve space to prevent CLS
- `lateBanner`: Insert banner after 2s (causes CLS when space not reserved)

### 🛍️ Products Grid (`/products`) - Coverage/Network Lab
**Focus**: Network optimization and code coverage analysis

**Available Toggles**:
- `injectThirdParty`: Load heavy blocking third-party script
- `loadExtraCSS`: Load CSS file with unused rules (4KB+ unused styles)
- `lazyOff`: Disable image lazy loading (eager load all 30 images)

### 📱 Product Detail (`/product/:id`) - INP/Long Tasks Lab
**Focus**: Interaction to Next Paint and main thread optimization

**Available Toggles**:
- `listenersPassive`: Use passive event listeners for touch/wheel
- `simulateLongTask`: Block main thread for 120ms on interactions
- `useWorker`: Move heavy formatting to Web Worker

### 🔍 Search Page (`/search`) - INP/Input Lab
**Focus**: Input responsiveness and search optimization

**Available Toggles**:
- `debounce`: Debounce search input (300ms delay)
- `microYield`: Chunk work with micro-yields between processing
- `useWorker`: Perform search in Web Worker (fallback to main thread)

### 🛒 Checkout (`/checkout`) - CLS/UX Lab
**Focus**: Layout stability and user experience

**Available Toggles**:
- `missingSizes`: Remove image dimensions (causes CLS)
- `intrinsicPlaceholders`: Use `content-visibility: auto` for placeholders

## Live Demo Scripts (Conference Runbook)

**⚠️ NOTA**: Estas demos están diseñadas para **grabación de videos** que puedes mostrar durante tu charla. Esto evita problemas técnicos en vivo y permite mejor control del timing.

### 🎬 Video Recording Strategy

En lugar de demos en vivo riesgosas, graba estos videos con anticipación:

1. **Video 1: LCP Optimization** (3-4 mins) - Home page optimization
2. **Video 2: Network Analysis** (2-3 mins) - Third-party impact 
3. **Video 3: INP Problems** (3-4 mins) - Long tasks and interactions
4. **Video 4: Input Responsiveness** (2-3 mins) - Search optimization
5. **Video 5: Advanced DevTools** (3-4 mins) - Master techniques

**Ver `VIDEO_RECORDING_GUIDE.md` para scripts detallados de grabación.**

<!--
DEMOS COMENTADAS - USA VIDEO_RECORDING_GUIDE.md EN SU LUGAR

### 🎯 Demo 1: LCP Optimization (5 minutes)

**Setup**:
1. Open `/?debug=1` in Chrome
2. Open DevTools → Performance panel
3. Turn OFF all LCP flags: `heroPreload`, `heroFetchPriorityHigh`, `fontPreconnect`, `reserveHeroSpace`

[... resto de demos comentadas para enfocar en videos ...]
-->

### 🎬 Quick Video Recording Reference

Para grabar los videos de tu charla, usa estas configuraciones:

**Video 1 - LCP Optimization:**
- Page: `http://localhost:5000/?debug=1`
- Flags OFF: `heroPreload`, `heroFetchPriorityHigh`, `fontPreconnect`, `reserveHeroSpace`
- Focus: Network waterfall + LCP improvement

**Video 2 - Network Analysis:**
- Page: `http://localhost:5000/products?debug=1`
- Flags ON: `injectThirdParty`, `loadExtraCSS`
- Focus: Performance + Network + Coverage correlation

**Video 3 - INP Optimization:**
- Page: `http://localhost:5000/product/1?debug=1`
- Flags ON: `simulateLongTask`, `listenersPassive=OFF`
- Focus: Long Tasks elimination

**Video 4 - Input Responsiveness:**
- Page: `http://localhost:5000/search?debug=1`
- Flags OFF: `debounce`, `microYield`, `useWorker`
- Focus: Search optimization

**Video 5 - Advanced DevTools:**
- Focus: Performance marks, AI features, Local Overrides, Coverage panel

**📋 Ver `VIDEO_RECORDING_GUIDE.md` para scripts completos de grabación.**

---

## Performance Monitoring Hooks

The app includes comprehensive performance marking for detailed analysis:

```javascript
// Automatic marks created:
'app-start'              // App initialization
'home-page-start/end'    // Home page load
'hero-image-loaded'      // Hero image LCP candidate
'products-page-start/end' // Products page load  
'render-products-start/end' // Product grid rendering
'search-start/end'       // Search operations
'add-to-cart-start/end'  // Cart interactions
'checkout-submit-start/end' // Form submissions
```

## DevTools Analysis Guide

### 🔍 Performance Panel Features
- **Web Vitals**: Enable to see LCP, INP, CLS markers
- **AI Assistance**: Right-click call tree → "Explain with AI"
- **Screenshots**: Enable to see visual progression
- **Memory**: Show memory usage patterns

### 📊 Key Metrics to Monitor
- **LCP (Largest Contentful Paint)**: Target <2.5s
- **INP (Interaction to Next Paint)**: Target <200ms  
- **CLS (Cumulative Layout Shift)**: Target <0.1
- **Long Tasks**: Identify >50ms blocking tasks

### 🛠️ Network Optimization
- **Resource Priority**: Check fetch priority hints
- **Preloading**: Verify preload links in Network
- **Third-Party**: Identify blocking external scripts
- **Coverage**: Find unused CSS/JS for optimization

## Technical Implementation

### Performance Utilities
```typescript
// Block main thread (for demo purposes)
block(120) // Blocks for 120ms

// Performance marking
addPerformanceMark('operation-start')
measurePerformance('operation', 'start', 'end')

// Worker management
const worker = new WorkerManager()
await worker.execute('heavy-task', data)
```

### Flag Management
```typescript
// Get current flags
const flags = getFlags()

// Toggle specific optimization
setFlag('heroPreload', true)

// Check active optimizations
const activeCount = getActiveFlagCount()
```

## Troubleshooting

### Common Issues

**Debug panel not showing**:
- Ensure URL contains `?debug=1`
- Check browser console for errors

**Performance measurements not visible**:
- Clear Performance timeline and re-record
- Enable "Web Vitals" checkbox in Performance panel
- Refresh page while recording

**Worker not available**:
- Check `/public/worker.js` exists
- Verify HTTPS or localhost (workers require secure context)
- Falls back to main thread automatically

**Third-party script not loading**:
- Check `/public/thirdparty.js` exists
- Verify network panel shows script request
- Banner should appear at top when loaded

### Browser Compatibility

- **Chrome 88+**: Full feature support including INP
- **Chrome DevTools**: Required for performance analysis
- **Local Development**: All features work on localhost
- **HTTPS**: Required for Web Workers in production

## File Structure

```
src/
├── components/
│   ├── pages/           # Route components
│   ├── DebugPanel.tsx   # Performance toggle UI
│   ├── Navigation.tsx   # App navigation
│   └── StatusBar.tsx    # Dev status display
├── lib/
│   ├── performance-flags.ts    # Flag management
│   ├── performance-utils.ts    # Perf utilities
│   └── types.ts               # TypeScript types
└── assets/images/       # Demo images
public/
├── thirdparty.js       # Heavy blocking script
├── extra.css          # Unused CSS for Coverage
└── worker.js          # Web Worker for offloading
```

### Conference Tips

### Speaker Preparation
1. **Pre-record videos**: Graba todos los demos con anticipación usando `VIDEO_RECORDING_GUIDE.md`
2. **Clear DevTools**: Asegúrate de que las DevTools estén bien configuradas para grabación
3. **Stable environment**: Usa throttling consistente para resultados predecibles
4. **Multiple takes**: Graba varias versiones de cada demo

### Audience Engagement
- **Video + live explanation**: Muestra videos pregrabados con narración en vivo
- **Before/after comparisons**: Videos claros con métricas específicas
- **Q&A scenarios**: Ten la app funcionando para preguntas específicas
- **Flag demonstrations**: Puedes hacer toggles en vivo durante Q&A si es necesario

### Demo Environment
- **Video backup**: Todos los demos como videos descargados localmente
- **Chrome DevTools**: Configuradas para máxima visibilidad en pantalla
- **Local app running**: Como fallback para preguntas específicas
- **Screen sharing optimized**: Resolución y tamaño optimizados para proyección

---

**Built for Chrome DevTools performance debugging conferences by the HyperCart Lab team** 🚀