import { ArrowLeft, Download, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReplacementComponent, ComponentInfo } from '@/types/component';
import { StatusBadge, RiskBadge } from './StatusBadge';
import { CompatibilityScore } from './CompatibilityScore';

interface ReplacementResultsProps {
    component: ComponentInfo;
    replacements: ReplacementComponent[];
    onSelectReplacement: (replacement: ReplacementComponent) => void;
    onBack: () => void;
    onExport: (format: 'pdf' | 'csv') => void;
}

export function ReplacementResults({
    component,
    replacements,
    onSelectReplacement,
    onBack,
    onExport,
}: ReplacementResultsProps) {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">
                            Replacement Options for{' '}
                            <span className="font-mono text-accent">{component.partNumber}</span>
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {replacements.length} compatible components found
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExport('csv')}
                        className="text-muted-foreground"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onExport('pdf')}
                        className="text-muted-foreground"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Results Table */}
            <div className="engineering-card overflow-hidden">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Manufacturer</th>
                            <th>Status</th>
                            <th>Compatibility</th>
                            <th>Risk Level</th>
                            <th>Warnings</th>
                            <th className="w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {replacements.map((replacement) => (
                            <tr
                                key={replacement.id}
                                className="cursor-pointer"
                                onClick={() => onSelectReplacement(replacement)}
                            >
                                <td>
                                    <div>
                                        <span className="font-mono font-medium text-foreground">
                                            {replacement.partNumber}
                                        </span>
                                        <p className="text-sm text-muted-foreground">{replacement.name}</p>
                                    </div>
                                </td>
                                <td className="text-muted-foreground">{replacement.manufacturer}</td>
                                <td>
                                    <StatusBadge status={replacement.status} />
                                </td>
                                <td>
                                    <CompatibilityScore score={replacement.compatibilityScore} size="sm" />
                                </td>
                                <td>
                                    <RiskBadge level={replacement.riskLevel} />
                                </td>
                                <td>
                                    {replacement.warnings.length > 0 ? (
                                        <div className="flex items-center gap-1 text-warning">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span className="text-sm">{replacement.warnings.length}</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">None</span>
                                    )}
                                </td>
                                <td>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>≥90% - Drop-in replacement</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span>70-89% - Minor modifications</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span>&lt;70% - Significant changes</span>
                </div>
            </div>
        </div>
    );
}