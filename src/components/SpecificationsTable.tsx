import { useState } from 'react';
import { Check, Pencil, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComponentInfo, ComponentSpecification } from '@/types/component';
import { StatusBadge } from './StatusBadge';

interface SpecificationsTableProps {
    component: ComponentInfo;
    specifications: ComponentSpecification[];
    onSpecificationChange: (id: string, value: string) => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function SpecificationsTable({
    component,
    specifications,
    onSpecificationChange,
    onConfirm,
    isLoading,
}: SpecificationsTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleEdit = (spec: ComponentSpecification) => {
        setEditingId(spec.id);
        setEditValue(spec.value);
    };

    const handleSave = (id: string) => {
        onSpecificationChange(id, editValue);
        setEditingId(null);
        setEditValue('');
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Component Info Card */}
            <div className="engineering-card p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-semibold text-foreground font-mono">
                                {component.partNumber}
                            </h2>
                            <StatusBadge status={component.status} />
                        </div>
                        <p className="text-foreground font-medium">{component.name}</p>
                        <p className="text-sm text-muted-foreground">{component.manufacturer}</p>
                        {component.description && (
                            <p className="text-sm text-muted-foreground mt-2">{component.description}</p>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wide bg-muted px-2 py-1 rounded">
                        {component.category}
                    </span>
                </div>
            </div>

            {/* Specifications Table */}
            <div className="engineering-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Extracted Specifications</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review and edit parameters as needed before finding replacements
                    </p>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Parameter</th>
                            <th>Value</th>
                            <th>Unit</th>
                            <th className="w-24">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specifications.map((spec) => (
                            <tr key={spec.id}>
                                <td className="font-medium">{spec.parameter}</td>
                                <td>
                                    {editingId === spec.id ? (
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="h-8 w-32 font-mono"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="font-mono">{spec.value}</span>
                                    )}
                                </td>
                                <td className="text-muted-foreground">{spec.unit}</td>
                                <td>
                                    {editingId === spec.id ? (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSave(spec.id)}
                                                className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10"
                                            >
                                                <Check className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancel}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(spec)}
                                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
                <Button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className="h-11 px-6 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                            Finding Replacements...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            Confirm & Find Replacements
                            <ArrowRight className="w-4 h-4" />
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}