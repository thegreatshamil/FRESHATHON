import { LifecycleStatus, RiskLevel } from '@/types/component';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
    status: LifecycleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'status-badge',
                status === 'Active' && 'status-active',
                status === 'EOL' && 'status-eol',
                status === 'NRND' && 'status-nrnd'
            )}
        >
            {status === 'EOL' ? 'End of Life' : status === 'NRND' ? 'Not Recommended' : 'Active'}
        </span>
    );
}

interface RiskBadgeProps {
    level: RiskLevel;
}

export function RiskBadge({ level }: RiskBadgeProps) {
    return (
        <span
            className={cn(
                'status-badge',
                level === 'Low' && 'risk-low',
                level === 'Medium' && 'risk-medium',
                level === 'High' && 'risk-high'
            )}
        >
            {level} Risk
        </span>
    );
}
