export type LifecycleStatus = 'Active' | 'EOL' | 'NRND';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface ComponentSpecification {
    id: string;
    parameter: string;
    value: string;
    unit?: string;
    isEditable?: boolean;
}

export interface ComponentInfo {
    partNumber: string;
    name: string;
    manufacturer: string;
    status: LifecycleStatus;
    category: string;
    description?: string;
}

export interface ReplacementComponent {
    id: string;
    partNumber: string;
    name: string;
    manufacturer: string;
    compatibilityScore: number;
    riskLevel: RiskLevel;
    status: LifecycleStatus;
    formMatch: number;
    fitMatch: number;
    functionMatch: number;
    matchedParameters: ParameterMatch[];
    mismatchedParameters: ParameterMatch[];
    warnings: string[];
    aiExplanation: string;
}

export interface ParameterMatch {
    parameter: string;
    originalValue: string;
    replacementValue: string;
    isMatch: boolean;
    severity?: 'info' | 'warning' | 'critical';
}

export interface AnalysisState {
    step: 'input' | 'specifications' | 'results' | 'detail';
    component: ComponentInfo | null;
    specifications: ComponentSpecification[];
    replacements: ReplacementComponent[];
    selectedReplacement: ReplacementComponent | null;
    isLoading: boolean;
}