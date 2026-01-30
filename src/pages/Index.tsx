import { useState } from 'react';
import { Header } from '@/components/Header';
import { LandingHero } from '@/components/LandingHero';
import { ComponentInput } from '@/components/ComponentInput';
import { SpecificationsTable } from '@/components/SpecificationsTable';
import { ReplacementResults } from '@/components/ReplacementResults';
import { ComponentDetail } from '@/components/ComponentDetail';
import { AnalysisState } from '@/types/component';
import { mockComponentInfo, mockSpecifications, mockReplacements } from '@/lib/mockData';
import { toast } from 'sonner';

const Index = () => {
    const [state, setState] = useState<AnalysisState>({
        step: 'input',
        component: null,
        specifications: [],
        replacements: [],
        selectedReplacement: null,
        isLoading: false,
    });

    const simulateLoading = (callback: () => void, delay = 1500) => {
        setState((prev) => ({ ...prev, isLoading: true }));
        setTimeout(() => {
            callback();
            setState((prev) => ({ ...prev, isLoading: false }));
        }, delay);
    };

    const handlePartNumberSubmit = (partNumber: string) => {
        simulateLoading(() => {
            // Simulate API call - use mock data
            setState((prev) => ({
                ...prev,
                step: 'specifications',
                component: { ...mockComponentInfo, partNumber },
                specifications: mockSpecifications,
            }));
            toast.success('Component identified successfully');
        });
    };

    const handleDatasheetUpload = (file: File) => {
        simulateLoading(() => {
            // Simulate PDF extraction - use mock data
            setState((prev) => ({
                ...prev,
                step: 'specifications',
                component: mockComponentInfo,
                specifications: mockSpecifications,
            }));
            toast.success(`Specifications extracted from ${file.name}`);
        }, 2000);
    };

    const handleSpecificationChange = (id: string, value: string) => {
        setState((prev) => ({
            ...prev,
            specifications: prev.specifications.map((spec) =>
                spec.id === id ? { ...spec, value } : spec
            ),
        }));
    };

    const handleConfirmSpecifications = () => {
        simulateLoading(() => {
            setState((prev) => ({
                ...prev,
                step: 'results',
                replacements: mockReplacements,
            }));
            toast.success(`Found ${mockReplacements.length} compatible replacements`);
        }, 2000);
    };

    const handleSelectReplacement = (replacement: typeof mockReplacements[0]) => {
        setState((prev) => ({
            ...prev,
            step: 'detail',
            selectedReplacement: replacement,
        }));
    };

    const handleBackToSpecifications = () => {
        setState((prev) => ({
            ...prev,
            step: 'specifications',
        }));
    };

    const handleBackToResults = () => {
        setState((prev) => ({
            ...prev,
            step: 'results',
            selectedReplacement: null,
        }));
    };

    const handleExport = (format: 'pdf' | 'csv') => {
        toast.success(`Export started (${format.toUpperCase()})`);
        // Placeholder for actual export functionality
    };

    const handleSaveDecision = () => {
        toast.success('Decision saved successfully');
        // Placeholder for save functionality
    };

    const handleStartOver = () => {
        setState({
            step: 'input',
            component: null,
            specifications: [],
            replacements: [],
            selectedReplacement: null,
            isLoading: false,
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {state.step === 'input' && (
                    <>
                        <LandingHero />
                        <ComponentInput
                            onPartNumberSubmit={handlePartNumberSubmit}
                            onDatasheetUpload={handleDatasheetUpload}
                            isLoading={state.isLoading}
                        />
                    </>
                )}

                {state.step === 'specifications' && state.component && (
                    <SpecificationsTable
                        component={state.component}
                        specifications={state.specifications}
                        onSpecificationChange={handleSpecificationChange}
                        onConfirm={handleConfirmSpecifications}
                        isLoading={state.isLoading}
                    />
                )}

                {state.step === 'results' && state.component && (
                    <ReplacementResults
                        component={state.component}
                        replacements={state.replacements}
                        onSelectReplacement={handleSelectReplacement}
                        onBack={handleBackToSpecifications}
                        onExport={handleExport}
                    />
                )}

                {state.step === 'detail' && state.component && state.selectedReplacement && (
                    <ComponentDetail
                        original={state.component}
                        replacement={state.selectedReplacement}
                        onBack={handleBackToResults}
                        onSaveDecision={handleSaveDecision}
                        onExport={handleExport}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card mt-auto">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-center text-sm text-muted-foreground">
                        AI-Assisted Component Replacement System • For engineering decision support only
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Index;
