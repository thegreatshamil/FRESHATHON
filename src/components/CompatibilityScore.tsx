import { cn } from '@/lib/utils';

interface CompatibilityScoreProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showBar?: boolean;
}

export function CompatibilityScore({ score, size = 'md', showBar = true }: CompatibilityScoreProps) {
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-success';
        if (score >= 70) return 'bg-warning';
        return 'bg-destructive';
    };

    const getTextColor = (score: number) => {
        if (score >= 90) return 'text-success';
        if (score >= 70) return 'text-warning';
        return 'text-destructive';
    };

    return (
        <div className="flex flex-col gap-1">
            <span
                className={cn(
                    'font-semibold font-mono',
                    getTextColor(score),
                    size === 'sm' && 'text-sm',
                    size === 'md' && 'text-base',
                    size === 'lg' && 'text-2xl'
                )}
            >
                {score}%
            </span>
            {showBar && (
                <div className="compatibility-bar w-20">
                    <div
                        className={cn('compatibility-fill', getScoreColor(score))}
                        style={{ width: `${score}%` }}
                    />
                </div>
            )}
        </div>
    );
}