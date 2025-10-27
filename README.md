# HyperCart Lab - Performance Debugging Demo

A production-ready React + TypeScript e-commerce demo application designed for Chrome DevTools performance debugging demonstrations. Features toggleable performance issues and a real-time Core Web Vitals dashboard for live optimization demos.

## Quick Start

```bash
# Clone and install
git clone <repository-url>
cd hypercart-lab
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

## Core Features

### 🎛️ Debug Panel
- **Toggle Access**: Add `?debug=1` to any URL to show the debug panel
- **Performance Flags**: 16+ toggleable optimizations and anti-patterns
- **Active Count Badge**: Shows number of active flags
- **Persistent Settings**: Flags saved in localStorage across sessions

### 📊 Performance Budget Monitor
- **Real-time Monitoring**: Live tracking of 14+ performance metrics
- **Budget Levels**: Conservative, Moderate, and Relaxed performance standards
- **Visual Indicators**: Color-coded status (Pass/Warning/Fail) with progress bars
- **Violation Alerts**: Immediate notifications when budgets are exceeded
- **Score System**: Overall performance score (0-100) based on budget compliance

### 📊 Core Web Vitals Dashboard
- **Real-time Metrics**: Live LCP, INP, CLS, FCP, TTFB monitoring
- **Color-coded Ratings**: Green (Good), Yellow (Needs Improvement), Red (Poor)
- **Always Available**: Circular button in bottom-right corner (no debug=1 needed)
- **Performance Validation**: Instantly see optimization effects

## Performance Budget System

### 🎯 Budget Levels & Thresholds

**Conservative (High Performance)**:
- LCP: ≤2.5s, INP: ≤200ms, CLS: ≤0.1
- Bundle Size: ≤500KB, JS: ≤300KB, CSS: ≤100KB
- Max 20 requests, 5 third-party, 0 long tasks

**Moderate (Balanced)**:
- LCP: ≤4s, INP: ≤500ms, CLS: ≤0.25  
- Bundle Size: ≤1MB, JS: ≤600KB, CSS: ≤200KB
- Max 50 requests, 10 third-party, 3 long tasks

**Relaxed (Basic)**:
- LCP: ≤6s, INP: ≤1s, CLS: ≤0.5
- Bundle Size: ≤2MB, JS: ≤1.2MB, CSS: ≤400KB  
- Max 100 requests, 20 third-party, 10 long tasks

### 📈 Budget Monitoring

Access via Debug Panel → "Budget Monitor" button:

- **Real-time Tracking**: 14 performance metrics monitored continuously
- **Visual Status**: ✅ Pass (Green), ⚠️ Warning (Yellow), ❌ Fail (Red)
- **Progress Bars**: Percentage of budget used with color coding
- **Violation Alerts**: Immediate notification when budgets exceeded
- **Overall Score**: 0-100 performance score based on compliance
- **Category Breakdown**: Core Web Vitals, Resources, Performance Quality

## Performance Flags Reference

### � LCP/CLS Optimization Flags
- `heroPreload`: Preload critical hero image for faster LCP
- `heroFetchPriorityHigh`: Use `fetchpriority="high"` attribute
- `fontPreconnect`: Preconnect to Google Fonts
- `reserveHeroSpace`: Reserve hero space to prevent layout shift
- `lateBanner`: **Anti-pattern** - Insert banner after load (causes CLS)

### 🌐 Network/Coverage Flags  
- `injectThirdParty`: **Anti-pattern** - Load blocking third-party script
- `loadExtraCSS`: **Anti-pattern** - Load CSS with 90% unused rules
- `lazyOff`: **Anti-pattern** - Disable image lazy loading

### ⚡ INP/Long Task Flags
- `listenersPassive`: Use passive event listeners for smooth scrolling
- `simulateLongTask`: **Anti-pattern** - Block main thread 120ms on interactions
- `useWorker`: Move heavy processing to Web Worker

### 🔍 Search/Input Flags
- `debounce`: Debounce search input (300ms delay)
- `microYield`: Chunk processing with micro-yields
- `useWorker`: Perform search operations in Web Worker

### 🎨 CLS/UX Flags
- `missingSizes`: **Anti-pattern** - Remove image dimensions
- `intrinsicPlaceholders`: Use `content-visibility: auto` for placeholders

## Demo Scenarios

### 📈 Demo 1: LCP Optimization (Home Page)

**Setup**: Open `http://localhost:5173/?debug=1`

**Baseline (Poor Performance)**:
1. Ensure all LCP flags are OFF: `heroPreload`, `heroFetchPriorityHigh`, `fontPreconnect`
2. Open Core Web Vitals Dashboard (bottom-right button)
3. Open Chrome DevTools → Performance panel
4. Record page load - observe LCP >3 seconds (Red rating)

**Apply Optimizations**:
1. Enable `heroPreload` → See immediate LCP improvement in dashboard
2. Enable `heroFetchPriorityHigh` → Further network prioritization  
3. Enable `fontPreconnect` → Faster text rendering
4. Final result: LCP <2.5s (Green rating in dashboard)

**Key Learning**: Network waterfall optimization and resource prioritization

### 🚀 Demo 2: Network Analysis (Products Page)

**Setup**: Open `http://localhost:5173/products?debug=1`

**Introduce Problems**:
1. Enable `injectThirdParty` → Blocking script appears
2. Enable `loadExtraCSS` → Unused CSS loading
3. Open DevTools → Network panel
4. Record page load → Show blocking resources

**Analysis Workflow**:
1. Performance panel → Identify Long Tasks from third-party
2. Network panel → Show blocking script correlation  
3. Coverage panel → Highlight 90% unused CSS
4. Disable flags → Show immediate improvement

**Key Learning**: Third-party impact and coverage analysis correlation

### ⚡ Demo 3: INP Optimization (Product Detail)

**Setup**: Open `http://localhost:5173/product/1?debug=1`

**Create Interaction Problems**:
1. Enable `simulateLongTask` 
2. Disable `listenersPassive`
3. Open Core Web Vitals Dashboard
4. Rapidly click "Add to Cart" → Observe poor INP (Red rating)

**Apply Solutions**:
1. Enable `useWorker` → Move processing off main thread
2. Enable `listenersPassive` → Smooth scrolling
3. Disable `simulateLongTask` → Remove artificial blocking
4. Test interactions → INP <200ms (Green rating)

**Key Learning**: Main thread optimization and Web Worker benefits

### 🔍 Demo 4: Input Responsiveness & Web Workers (Search)

**Setup**: Open `http://localhost:5173/search?debug=1`

**Problematic Input (Main Thread Blocking)**:
1. Ensure OFF: `debounce`, `microYield`, `useWorker`
2. Open Performance panel and start recording
3. Type rapidly: "smartphone case protection wireless"
4. Observe input lag, blocking main thread, and constant re-searching

**Progressive Enhancement**:
1. Enable `debounce` → Reduce search frequency (300ms delay)
2. Enable `microYield` → Chunk processing to prevent blocking
3. Enable `useWorker` → **Web Worker background processing** ✨
4. Repeat typing → Smooth, responsive input with no main thread blocking

**Key Code Demonstration**:
```typescript
// BEFORE ❌: Blocks main thread
const results = performSearch(query, flags);
    
// AFTER ✅: Offloads to worker
const results = await worker.execute('search', { query, products });
```

**Visual Indicators**:
- 🟢 Green dot: "Search processing in Web Worker (non-blocking)"  
- 🟡 Yellow dot: "Search processing on main thread"

**Key Learning**: Main thread optimization, Web Worker benefits, and "Reduce JS Cost & Free Main Thread" technique

### 🧰 Demo 5: Performance Budget Management

**Setup**: Open `http://localhost:5173/products?debug=1`

**Budget Baseline**:
1. Open Debug Panel → Click "Budget Monitor"
2. Set Budget Level to "Conservative" (strict thresholds)
3. Observe current performance score and violations
4. Note which metrics are failing (likely bundle size, requests)

**Introduce Budget Violations**:
1. Enable `injectThirdParty` → Increases third-party requests
2. Enable `loadExtraCSS` → Adds unused CSS, increases bundle size
3. Enable `simulateLongTask` → Creates long tasks
4. Watch real-time budget violations appear in red alerts

**Budget Impact Analysis**:
1. Budget score drops (e.g., 85 → 45)
2. Multiple violations appear: Third-party requests, CSS size, Long tasks
3. Progress bars turn red showing budget exceeded
4. Overall performance classification degrades

**Apply Optimizations**:
1. Disable problem flags: `injectThirdParty`, `loadExtraCSS`, `simulateLongTask`
2. Enable optimizations: `useWorker`, `debounce`, `heroPreload`
3. Switch to "Moderate" budget for more realistic thresholds
4. Observe budget compliance improvement

**Budget Level Comparison**:
- **Conservative**: Strict production standards (may show violations)
- **Moderate**: Balanced for most apps (realistic targets)
- **Relaxed**: Minimum acceptable (should mostly pass)

**Key Learning**: Performance budgets provide measurable targets and accountability for optimization efforts

### 🧰 Demo 6: Advanced DevTools Features

**Performance Marks Analysis**:
1. Open Performance panel
2. Record any page interaction
3. Locate custom performance marks: `home-page-start`, `add-to-cart-start`
4. Right-click call tree → "Explain with AI" (Chrome 127+)

**Core Web Vitals Integration**:
1. Enable "Web Vitals" in Performance panel
2. Compare DevTools metrics with real-time dashboard
3. Show correlation between optimization flags and metric improvements

**Coverage-driven Optimization**:
1. Open Coverage panel
2. Record page usage
3. Identify unused code (red bars)
4. Toggle `loadExtraCSS` to demonstrate impact

**Key Learning**: Advanced debugging techniques and AI-assisted analysis

## Technical Implementation

### Performance Budget API
```typescript
// Set budget level
setBudgetLevel('conservative'); // 'moderate' | 'relaxed'

// Get current budget thresholds
const budget = getCurrentBudget();
// Returns: { lcp: 2500, inp: 200, cls: 0.1, totalSize: 500, ... }

// Monitor performance
const collector = getPerformanceCollector();
const status = collector.getBudgetStatus();

// Check violations
const violations = checkBudgetViolations();
violations.forEach(v => {
  console.log(`${v.name}: ${v.actual}${v.unit} exceeds ${v.budget}${v.unit}`);
});

// Get summary score
const { score, passed, failed } = getBudgetSummary();
console.log(`Performance Score: ${score}/100 (${passed} passed, ${failed} failed)`);
```

### Performance Utilities
```typescript
// Block main thread (for demo purposes)
block(120) // Blocks for 120ms

// Performance marking
addPerformanceMark('operation-start')
measurePerformance('operation', 'start', 'end')

// Worker management - ACTUAL IMPLEMENTATION ✨
const worker = new WorkerManager()
const results = await worker.execute('search', { query, products })

// Search optimization patterns
// BEFORE ❌: Main thread blocking
const performMainThreadSearch = (searchTerms) => {
  // Heavy computation blocks UI
  for (let i = 0; i < 50000; i++) {
    Math.sin(i) * Math.cos(i);
  }
  return products.filter(/* search logic */);
}

// AFTER ✅: Web Worker non-blocking  
const performWorkerSearch = async (query, products) => {
  return await worker.execute('search', { query, products });
}

// Listener optimization
addPassiveListeners(element, ['scroll', 'touchmove'], handler)
addNonPassiveListeners(element, ['click'], handler)
```

### Performance Monitoring

The app automatically creates performance marks for analysis:

```javascript
// Page lifecycle marks
'app-start'                    // Application initialization
'home-page-start/end'          // Home page load timing
'products-page-start/end'      // Products page load timing
'product-detail-start/end'     // Product detail load timing
'search-start/end'             // Search operation timing

// Interaction marks  
'add-to-cart-start/end'        // Cart interaction timing
'checkout-submit-start/end'    // Form submission timing
'render-products-start/end'    // Product grid rendering

// Asset loading marks
'hero-image-loaded'            // Hero image LCP candidate
'block-start/end'              // Main thread blocking simulation
```

### Core Web Vitals Dashboard API

```typescript
interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
}

// Thresholds used by dashboard
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },    // milliseconds
  inp: { good: 200, poor: 500 },      // milliseconds  
  cls: { good: 0.1, poor: 0.25 },     // ratio
  fcp: { good: 1800, poor: 3000 },    // milliseconds
  ttfb: { good: 800, poor: 1800 },    // milliseconds
};
```

### Flag Management System
```typescript
// Get current flags
const flags = getFlags()

// Toggle specific optimization
setFlag('heroPreload', true)
toggleFlag('simulateLongTask')

// Check active optimizations
const activeCount = getActiveFlagCount()
const activeFlags = getActiveFlags()

// Flags persist in localStorage
// Key: 'hypercart-flags'
```

## DevTools Analysis Guide

### 🔍 Performance Panel Setup
- **Web Vitals**: Enable checkbox to see LCP, INP, CLS markers in timeline
- **Screenshots**: Enable to visualize loading progression
- **Memory**: Monitor memory usage patterns during interactions
- **CPU Throttling**: Use 4x slowdown for more visible effects

### 📊 Key Metrics to Monitor
- **LCP (Largest Contentful Paint)**: Target <2.5s (Green in dashboard)
- **INP (Interaction to Next Paint)**: Target <200ms (Green in dashboard)  
- **CLS (Cumulative Layout Shift)**: Target <0.1 (Green in dashboard)
- **Long Tasks**: Identify red blocks >50ms in timeline
- **FCP (First Contentful Paint)**: Target <1.8s
- **TTFB (Time to First Byte)**: Target <800ms

### 🛠️ Network Analysis Workflow
1. **Resource Priority**: Check fetch priority hints in Network panel
2. **Preloading**: Verify preload links appear early in waterfall
3. **Third-Party Impact**: Identify blocking external scripts with `injectThirdParty`
4. **Coverage Analysis**: Use Coverage panel to find unused CSS/JS
5. **Correlation**: Match Performance timeline Long Tasks to Network requests

### 🤖 AI-Powered Analysis (Chrome 127+)
- Right-click any function in Performance call tree
- Select "Explain with AI" for detailed optimization suggestions
- Use for complex performance bottleneck analysis

## Browser Compatibility & Requirements

### Minimum Requirements
- **Chrome 88+**: Full Core Web Vitals support (LCP, FID, CLS)
- **Chrome 96+**: INP metric support  
- **Chrome 127+**: AI-powered DevTools features
- **HTTPS/Localhost**: Required for Web Workers in production

### Recommended Setup
- **Chrome DevTools**: Latest version for all features
- **Desktop Chrome**: Best performance analysis experience
- **High-resolution display**: For clear metric visualization during demos

## File Structure

```
src/
├── components/
│   ├── pages/                    # Main route components
│   │   ├── HomePage.tsx          # LCP/CLS demo page
│   │   ├── ProductsPage.tsx      # Network/Coverage demo  
│   │   ├── ProductDetailPage.tsx # INP/Long Tasks demo
│   │   ├── SearchPage.tsx        # Input responsiveness demo
│   │   └── CheckoutPage.tsx      # CLS/UX demo
│   ├── DebugPanel.tsx            # Performance flags UI
│   ├── PerformanceDashboard.tsx  # Core Web Vitals dashboard
│   ├── Navigation.tsx            # App navigation
│   ├── StatusBar.tsx             # Development status
│   └── ui/                       # Reusable UI components
├── lib/
│   ├── performance-flags.ts      # Flag management system
│   ├── performance-utils.ts      # Performance utilities & blocking
│   ├── products.ts               # Demo product data
│   ├── product-images.ts         # Local image management
│   └── types.ts                  # TypeScript definitions
├── assets/
│   ├── images/                   # Local product & hero images
│   └── video/                    # Hero background video
└── hooks/
    ├── use-cart.ts               # Shopping cart state management
    └── use-mobile.ts             # Mobile detection

public/
├── thirdparty.js                 # Heavy blocking script for demos
├── extra.css                     # Unused CSS for Coverage analysis
└── worker.js                     # Web Worker for background processing
```

## Troubleshooting

### Common Issues

**Debug panel not visible**:
- Ensure URL contains `?debug=1` 
- Clear browser cache and localStorage
- Check browser console for JavaScript errors

**Core Web Vitals Dashboard not updating**:
- Refresh page to reset metrics
- Ensure sufficient user interactions for INP measurement
- Check that performance observers are supported (Chrome 88+)

**Performance measurements missing**:
- Enable "Web Vitals" checkbox in Performance panel
- Clear timeline before recording new session
- Ensure page has sufficient content for LCP measurement

**Worker functionality failing**:
- Verify `/public/worker.js` exists and is accessible
- Check HTTPS or localhost requirement (workers need secure context)
- Falls back to main thread processing automatically

**Third-party script not loading**:
- Confirm `/public/thirdparty.js` exists
- Check Network panel for successful script request
- Look for banner appearance at top when script loads

**Flags not persisting**:
- Check localStorage is enabled in browser
- Clear localStorage and reset flags if corrupted
- Flags stored under key: `hypercart-flags`

### Performance Tips

**For Consistent Demo Results**:
- Use CPU throttling (4x slowdown) for more visible effects
- Clear cache between demo runs for consistent loading times
- Close other browser tabs to reduce system impact
- Use Incognito mode to avoid extension interference

**For Video Recording**:
- Use fixed browser window size for consistent framing
- Enable high contrast mode for better visibility
- Record at lower playback speed, then speed up in editing
- Test demo flow multiple times before recording

---

**Built for Chrome DevTools performance debugging demonstrations** 🚀  

*HyperCart Lab provides a realistic e-commerce environment for learning and demonstrating Core Web Vitals optimization techniques with real-time feedback and comprehensive debugging tools.*