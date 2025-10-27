import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getPerformanceCollector, 
  getBudgetLevel, 
  setBudgetLevel, 
  getBudgetSummary,
  checkBudgetViolations,
  type BudgetLevel,
  type BudgetStatus 
} from '@/lib/performance-budgets';
import { ChartBar, Warning, CheckCircle, XCircle, Speedometer } from '@phosphor-icons/react';

interface PerformanceBudgetDashboardProps {
  visible: boolean;
  onClose?: () => void;
}

export function PerformanceBudgetDashboard({ visible, onClose }: PerformanceBudgetDashboardProps) {
  const [budgetLevel, setBudgetLevelState] = useState<BudgetLevel>(getBudgetLevel());
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [summary, setSummary] = useState(getBudgetSummary());
  const [violations, setViolations] = useState<BudgetStatus[]>([]);

  useEffect(() => {
    const updateBudgetData = () => {
      const collector = getPerformanceCollector();
      const statuses = collector.getBudgetStatus();
      const currentSummary = getBudgetSummary();
      const currentViolations = checkBudgetViolations();

      setBudgetStatus(statuses);
      setSummary(currentSummary);
      setViolations(currentViolations);
    };

    // Initial load
    updateBudgetData();

    // Update every 2 seconds for real-time monitoring
    const interval = setInterval(updateBudgetData, 2000);

    return () => clearInterval(interval);
  }, [budgetLevel]);

  const handleBudgetLevelChange = (newLevel: BudgetLevel) => {
    setBudgetLevel(newLevel);
    setBudgetLevelState(newLevel);
    
    // Reset collector to recalculate with new budget
    setTimeout(() => {
      const collector = getPerformanceCollector();
      setBudgetStatus(collector.getBudgetStatus());
      setSummary(getBudgetSummary());
      setViolations(checkBudgetViolations());
    }, 100);
  };

  const getStatusColor = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'fail': return 'text-red-600 bg-red-50';
    }
  };

  const getStatusIcon = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return <CheckCircle size={16} className="text-green-600" />;
      case 'warning': return <Warning size={16} className="text-yellow-600" />;
      case 'fail': return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (status: 'pass' | 'warning' | 'fail') => {
    switch (status) {
      case 'pass': return '[&>div]:bg-green-500';
      case 'warning': return '[&>div]:bg-yellow-500';
      case 'fail': return '[&>div]:bg-red-500';
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === 'ms' && value > 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === 'KB' && value > 1024) {
      return `${(value / 1024).toFixed(1)}MB`;
    }
    return `${value}${unit}`;
  };

  if (!visible) return null;

  return (
    <div className="performance-budget-dashboard">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ChartBar size={24} className="text-primary" />
          <h2 className="text-xl font-semibold">Performance Budget Monitor</h2>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Budget Level Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Budget Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Budget Level:</label>
            <Select value={budgetLevel} onValueChange={handleBudgetLevelChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (High Performance)</SelectItem>
                <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                <SelectItem value="relaxed">Relaxed (Basic)</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Speedometer size={20} className={getScoreColor(summary.score)} />
              <span className={`font-bold ${getScoreColor(summary.score)}`}>
                {summary.score}/100
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
            <div className="text-sm text-muted-foreground">Warnings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total Metrics</div>
          </CardContent>
        </Card>
      </div>

      {/* Violations Alert */}
      {violations.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Warning size={20} />
              Budget Violations ({violations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {violations.map((violation) => (
                <div key={violation.metric} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{violation.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600">
                      {formatValue(violation.actual, violation.unit)} / {formatValue(violation.budget, violation.unit)}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      {violation.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Detailed Budget Status</h3>
        
        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Core Web Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetStatus
                .filter(status => ['lcp', 'inp', 'cls', 'fcp', 'ttfb'].includes(status.metric))
                .map((status) => (
                <div key={status.metric} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Progress 
                      value={Math.min(status.percentage, 100)} 
                      className={`flex-1 ${getProgressColor(status.status)}`}
                    />
                    <div className="text-sm min-w-24 text-right">
                      <span className={status.status === 'fail' ? 'text-red-600 font-medium' : ''}>
                        {formatValue(status.actual, status.unit)}
                      </span>
                      <span className="text-muted-foreground">
                        {' / '}{formatValue(status.budget, status.unit)}
                      </span>
                    </div>
                    <Badge 
                      variant={status.status === 'pass' ? 'default' : 'secondary'}
                      className={`${getStatusColor(status.status)} min-w-16 justify-center`}
                    >
                      {status.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resource Budgets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resource Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetStatus
                .filter(status => ['totalSize', 'jsSize', 'cssSize', 'imageSize', 'requests', 'thirdPartyRequests'].includes(status.metric))
                .map((status) => (
                <div key={status.metric} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Progress 
                      value={Math.min(status.percentage, 100)} 
                      className={`flex-1 ${getProgressColor(status.status)}`}
                    />
                    <div className="text-sm min-w-24 text-right">
                      <span className={status.status === 'fail' ? 'text-red-600 font-medium' : ''}>
                        {formatValue(status.actual, status.unit)}
                      </span>
                      <span className="text-muted-foreground">
                        {' / '}{formatValue(status.budget, status.unit)}
                      </span>
                    </div>
                    <Badge 
                      variant={status.status === 'pass' ? 'default' : 'secondary'}
                      className={`${getStatusColor(status.status)} min-w-16 justify-center`}
                    >
                      {status.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Budgets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetStatus
                .filter(status => ['longTasks', 'mainThreadTime', 'layoutShifts'].includes(status.metric))
                .map((status) => (
                <div key={status.metric} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(status.status)}
                    <span className="text-sm font-medium">{status.name}</span>
                  </div>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Progress 
                      value={Math.min(status.percentage, 100)} 
                      className={`flex-1 ${getProgressColor(status.status)}`}
                    />
                    <div className="text-sm min-w-24 text-right">
                      <span className={status.status === 'fail' ? 'text-red-600 font-medium' : ''}>
                        {formatValue(status.actual, status.unit)}
                      </span>
                      <span className="text-muted-foreground">
                        {' / '}{formatValue(status.budget, status.unit)}
                      </span>
                    </div>
                    <Badge 
                      variant={status.status === 'pass' ? 'default' : 'secondary'}
                      className={`${getStatusColor(status.status)} min-w-16 justify-center`}
                    >
                      {status.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">📊 Performance Budget Levels:</p>
            <ul className="space-y-1 text-xs">
              <li><strong>Conservative:</strong> High performance standards for production apps</li>
              <li><strong>Moderate:</strong> Balanced approach for most applications</li>
              <li><strong>Relaxed:</strong> Minimum acceptable performance thresholds</li>
            </ul>
            <p className="mt-3 text-xs">
              💡 Use performance flags in the debug panel to see how optimizations affect your budget compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PerformanceBudgetDashboard;