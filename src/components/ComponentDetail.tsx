import { ArrowLeft, Check, X, AlertTriangle, Info, Lightbulb, Download, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReplacementComponent, ComponentInfo } from '@/types/component';
import { StatusBadge, RiskBadge } from './StatusBadge';
import { CompatibilityScore } from './CompatibilityScore';
import { cn } from '@/lib/utils';

interface ComponentDetailProps {
    original: ComponentInfo;
    replacement: ReplacementComponent;
    onBack: () => void;
    onSaveDecision: () => void;
    onExport: (format: 'pdf' | 'csv') => void;
}

export function ComponentDetail({
    original,
    replacement,
    onBack,
    onSaveDecision,
    onExport,
}: ComponentDetailProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Results
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExport('pdf')}
                        className="text-muted-foreground"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSaveDecision}
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Decision
                    </Button>
                </div>
            </div>

            {/* Component Comparison Header */}
            <div className="engineering-card p-6">
                <div className="grid grid-cols-2 gap-8">
                    {/* Original */}
                    <div className="border-r border-border pr-8">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Original Component</p>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold font-mono text-foreground">{original.partNumber}</h3>
                            <StatusBadge status={original.status} />
                        </div>
                        <p className="text-muted-foreground">{original.manufacturer}</p>
                    </div>
                    {/* Replacement */}
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Proposed Replacement</p>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold font-mono text-foreground">{replacement.partNumber}</h3>
                            <StatusBadge status={replacement.status} />
                        </div>
                        <p className="text-muted-foreground">{replacement.manufacturer}</p>
                    </div>
                </div>
            </div>

            {/* Score Overview */}
            <div className="grid grid-cols-4 gap-4">
                <div className="engineering-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Overall Score</p>
                    <CompatibilityScore score={replacement.compatibilityScore} size="lg" showBar={false} />
                </div>
                <div className="engineering-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Form Match</p>
                    <CompatibilityScore score={replacement.formMatch} size="lg" showBar={false} />
                </div>
                <div className="engineering-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Fit Match</p>
                    <CompatibilityScore score={replacement.fitMatch} size="lg" showBar={false} />
                </div>
                <div className="engineering-card p-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Function Match</p>
                    <CompatibilityScore score={replacement.functionMatch} size="lg" showBar={false} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Parameter Matches */}
                <div className="engineering-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-success/5">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-success" />
                            <h4 className="font-medium text-foreground">Matched Parameters</h4>
                        </div>
                    </div>
                    <div className="divide-y divide-border/50">
                        {replacement.matchedParameters.map((param, idx) => (
                            <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{param.parameter}</span>
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="font-mono text-foreground">{param.originalValue}</span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="font-mono text-success">{param.replacementValue}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parameter Mismatches */}
                <div className="engineering-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-warning/5">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-warning" />
                            <h4 className="font-medium text-foreground">Mismatched Parameters</h4>
                        </div>
                    </div>
                    <div className="divide-y divide-border/50">
                        {replacement.mismatchedParameters.length > 0 ? (
                            replacement.mismatchedParameters.map((param, idx) => (
                                <div key={idx} className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">{param.parameter}</span>
                                        {param.severity === 'critical' && (
                                            <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Critical</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="font-mono text-foreground">{param.originalValue}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className={cn(
                                            'font-mono',
                                            param.severity === 'critical' ? 'text-destructive' :
                                                param.severity === 'warning' ? 'text-warning' : 'text-muted-foreground'
                                        )}>
                                            {param.replacementValue}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                No parameter mismatches detected
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Warnings */}
            {replacement.warnings.length > 0 && (
                <div className="engineering-card overflow-hidden">
                    <div className="px-4 py-3 border-b border-border bg-destructive/5">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <h4 className="font-medium text-foreground">Warnings & Risk Flags</h4>
                            <RiskBadge level={replacement.riskLevel} />
                        </div>
                    </div>
                    <ul className="divide-y divide-border/50">
                        {replacement.warnings.map((warning, idx) => (
                            <li key={idx} className="px-4 py-3 flex items-start gap-3">
                                <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-foreground">{warning}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* AI Explanation */}
            <div className="engineering-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-accent/5">
                    <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-accent" />
                        <h4 className="font-medium text-foreground">AI Analysis & Recommendation</h4>
                    </div>
                </div>
                <div className="px-4 py-4">
                    <p className="text-sm text-foreground leading-relaxed">{replacement.aiExplanation}</p>
                </div>
            </div>

            {/* Info Notice */}
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Disclaimer</p>
                    <p>
                        This AI-generated analysis is provided for informational purposes only.
                        Always verify component compatibility with official datasheets and conduct
                        appropriate qualification testing before production use.
                    </p>
                </div>
            </div>
        </div>
    );
}
