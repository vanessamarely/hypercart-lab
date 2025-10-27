// Performance Budget Management System

export interface PerformanceBudget {
  // Core Web Vitals Budgets
  lcp: number;      // Largest Contentful Paint (ms)
  inp: number;      // Interaction to Next Paint (ms) 
  cls: number;      // Cumulative Layout Shift (ratio)
  fcp: number;      // First Contentful Paint (ms)
  ttfb: number;     // Time to First Byte (ms)
  
  // Resource Budgets
  totalSize: number;        // Total bundle size (KB)
  jsSize: number;          // JavaScript size (KB)
  cssSize: number;         // CSS size (KB)
  imageSize: number;       // Images size (KB)
  
  // Network Budgets
  requests: number;        // Total HTTP requests
  thirdPartyRequests: number; // Third-party requests
  
  // Performance Budgets
  longTasks: number;       // Max long tasks count
  mainThreadTime: number;  // Main thread blocking time (ms)
  layoutShifts: number;    // Max layout shift count
}

export interface BudgetStatus {
  metric: keyof PerformanceBudget;
  name: string;
  budget: number;
  actual: number;
  status: 'pass' | 'warning' | 'fail';
  percentage: number;
  unit: string;
}

// Performance Budget Configurations
export const PERFORMANCE_BUDGETS = {
  // Conservative budget (good performance)
  conservative: {
    lcp: 2500,
    inp: 200, 
    cls: 0.1,
    fcp: 1800,
    ttfb: 800,
    totalSize: 500,
    jsSize: 300,
    cssSize: 100,
    imageSize: 1000,
    requests: 20,
    thirdPartyRequests: 5,
    longTasks: 0,
    mainThreadTime: 100,
    layoutShifts: 1
  } as PerformanceBudget,
  
  // Moderate budget (acceptable performance)
  moderate: {
    lcp: 4000,
    inp: 500,
    cls: 0.25,
    fcp: 3000,
    ttfb: 1800,
    totalSize: 1000,
    jsSize: 600,
    cssSize: 200,
    imageSize: 2000,
    requests: 50,
    thirdPartyRequests: 10,
    longTasks: 3,
    mainThreadTime: 300,
    layoutShifts: 3
  } as PerformanceBudget,
  
  // Relaxed budget (minimum acceptable)
  relaxed: {
    lcp: 6000,
    inp: 1000,
    cls: 0.5,
    fcp: 4500,
    ttfb: 3000,
    totalSize: 2000,
    jsSize: 1200,
    cssSize: 400,
    imageSize: 4000,
    requests: 100,
    thirdPartyRequests: 20,
    longTasks: 10,
    mainThreadTime: 1000,
    layoutShifts: 5
  } as PerformanceBudget
} as const;

export type BudgetLevel = keyof typeof PERFORMANCE_BUDGETS;

// Current active budget level
let currentBudgetLevel: BudgetLevel = 'moderate';

export function getBudgetLevel(): BudgetLevel {
  if (typeof window === 'undefined') return currentBudgetLevel;
  
  try {
    const stored = localStorage.getItem('performance-budget-level');
    if (stored && stored in PERFORMANCE_BUDGETS) {
      currentBudgetLevel = stored as BudgetLevel;
    }
  } catch (error) {
    console.warn('Failed to load budget level from localStorage:', error);
  }
  
  return currentBudgetLevel;
}

export function setBudgetLevel(level: BudgetLevel): void {
  currentBudgetLevel = level;
  
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('performance-budget-level', level);
    } catch (error) {
      console.warn('Failed to save budget level to localStorage:', error);
    }
  }
}

export function getCurrentBudget(): PerformanceBudget {
  return PERFORMANCE_BUDGETS[getBudgetLevel()];
}

// Performance metrics collection
export class PerformanceCollector {
  private metrics: Partial<PerformanceBudget> = {};
  private observer: PerformanceObserver | null = null;
  private longTaskCount = 0;
  private mainThreadBlockingTime = 0;
  private layoutShiftCount = 0;

  constructor() {
    this.initializeObservers();
    this.collectResourceMetrics();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe Web Vitals and Long Tasks
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processEntry(entry);
        }
      });

      // Observe different entry types
      const entryTypes = ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift', 'longtask'];
      
      entryTypes.forEach(type => {
        try {
          this.observer!.observe({ type, buffered: true });
        } catch (error) {
          console.warn(`Failed to observe ${type}:`, error);
        }
      });

    } catch (error) {
      console.warn('Failed to initialize PerformanceObserver:', error);
    }
  }

  private processEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
        break;

      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        break;

      case 'layout-shift':
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          this.layoutShiftCount++;
          this.metrics.layoutShifts = this.layoutShiftCount;
          
          // Accumulate CLS score
          this.metrics.cls = (this.metrics.cls || 0) + clsEntry.value;
        }
        break;

      case 'longtask':
        this.longTaskCount++;
        this.mainThreadBlockingTime += entry.duration;
        this.metrics.longTasks = this.longTaskCount;
        this.metrics.mainThreadTime = this.mainThreadBlockingTime;
        break;
    }
  }

  private async collectResourceMetrics(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Wait for resources to load
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(void 0);
      } else {
        window.addEventListener('load', () => resolve(void 0));
      }
    });

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let imageSize = 0;
    let requestCount = 0;
    let thirdPartyCount = 0;

    const currentOrigin = window.location.origin;

    resources.forEach(resource => {
      const size = resource.transferSize || resource.encodedBodySize || 0;
      totalSize += size;
      requestCount++;

      // Check if third-party
      if (!resource.name.startsWith(currentOrigin)) {
        thirdPartyCount++;
      }

      // Categorize by type
      if (resource.name.endsWith('.js') || resource.name.includes('javascript')) {
        jsSize += size;
      } else if (resource.name.endsWith('.css') || resource.name.includes('stylesheet')) {
        cssSize += size;
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        imageSize += size;
      }
    });

    // Convert bytes to KB
    this.metrics.totalSize = Math.round(totalSize / 1024);
    this.metrics.jsSize = Math.round(jsSize / 1024);
    this.metrics.cssSize = Math.round(cssSize / 1024);
    this.metrics.imageSize = Math.round(imageSize / 1024);
    this.metrics.requests = requestCount;
    this.metrics.thirdPartyRequests = thirdPartyCount;
  }

  // Collect INP manually since it's not in PerformanceObserver yet
  public recordInteraction(duration: number): void {
    if (!this.metrics.inp || duration > this.metrics.inp) {
      this.metrics.inp = duration;
    }
  }

  public getMetrics(): Partial<PerformanceBudget> {
    return { ...this.metrics };
  }

  public getBudgetStatus(): BudgetStatus[] {
    const budget = getCurrentBudget();
    const metrics = this.getMetrics();
    
    const statuses: BudgetStatus[] = [];

    // Helper function to determine status
    const getStatus = (actual: number, budget: number, lowerIsBetter = true): 'pass' | 'warning' | 'fail' => {
      const ratio = lowerIsBetter ? actual / budget : budget / actual;
      if (ratio <= 0.8) return 'pass';
      if (ratio <= 1.0) return 'warning';
      return 'fail';
    };

    const budgetEntries: Array<{
      key: keyof PerformanceBudget;
      name: string;
      unit: string;
      lowerIsBetter?: boolean;
    }> = [
      { key: 'lcp', name: 'Largest Contentful Paint', unit: 'ms' },
      { key: 'inp', name: 'Interaction to Next Paint', unit: 'ms' },
      { key: 'cls', name: 'Cumulative Layout Shift', unit: '' },
      { key: 'fcp', name: 'First Contentful Paint', unit: 'ms' },
      { key: 'ttfb', name: 'Time to First Byte', unit: 'ms' },
      { key: 'totalSize', name: 'Total Bundle Size', unit: 'KB' },
      { key: 'jsSize', name: 'JavaScript Size', unit: 'KB' },
      { key: 'cssSize', name: 'CSS Size', unit: 'KB' },
      { key: 'imageSize', name: 'Image Size', unit: 'KB' },
      { key: 'requests', name: 'HTTP Requests', unit: '' },
      { key: 'thirdPartyRequests', name: 'Third-party Requests', unit: '' },
      { key: 'longTasks', name: 'Long Tasks', unit: '' },
      { key: 'mainThreadTime', name: 'Main Thread Blocking', unit: 'ms' },
      { key: 'layoutShifts', name: 'Layout Shifts', unit: '' }
    ];

    budgetEntries.forEach(({ key, name, unit, lowerIsBetter = true }) => {
      const budgetValue = budget[key];
      const actualValue = metrics[key];

      if (actualValue !== undefined && budgetValue !== undefined) {
        const status = getStatus(actualValue, budgetValue, lowerIsBetter);
        const percentage = lowerIsBetter 
          ? (actualValue / budgetValue) * 100
          : (budgetValue / actualValue) * 100;

        statuses.push({
          metric: key,
          name,
          budget: budgetValue,
          actual: actualValue,
          status,
          percentage: Math.round(percentage),
          unit
        });
      }
    });

    return statuses;
  }

  public disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Global performance collector instance
let globalCollector: PerformanceCollector | null = null;

export function getPerformanceCollector(): PerformanceCollector {
  if (!globalCollector) {
    globalCollector = new PerformanceCollector();
  }
  return globalCollector;
}

export function resetPerformanceCollector(): void {
  if (globalCollector) {
    globalCollector.disconnect();
  }
  globalCollector = new PerformanceCollector();
}

// Utility functions for budget monitoring
export function checkBudgetViolations(): BudgetStatus[] {
  const collector = getPerformanceCollector();
  const statuses = collector.getBudgetStatus();
  return statuses.filter(status => status.status === 'fail');
}

export function getBudgetSummary(): {
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  score: number;
} {
  const collector = getPerformanceCollector();
  const statuses = collector.getBudgetStatus();
  
  const total = statuses.length;
  const passed = statuses.filter(s => s.status === 'pass').length;
  const warnings = statuses.filter(s => s.status === 'warning').length;
  const failed = statuses.filter(s => s.status === 'fail').length;
  
  // Calculate score (0-100)
  const score = total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 100;
  
  return { total, passed, warnings, failed, score };
}