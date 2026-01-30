import { Cpu } from 'lucide-react';

export function Header() {
    return (
        <header className="border-b border-border bg-card">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                        <Cpu className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-foreground">
                            AI-Assisted Component Replacement
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Form-Fit-Function Analysis System
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}