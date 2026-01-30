import { Cpu, Search, FileText, Shield, Zap } from 'lucide-react';

export function LandingHero() {
    return (
        <div className="text-center mb-12 animate-fade-in">
            <div className="flex justify-center mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-lg">
                    <Cpu className="w-8 h-8 text-primary-foreground" />
                </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
                AI-Assisted Component Replacement System
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                Find safe replacements for obsolete electronic components using AI-powered
                Form-Fit-Function analysis
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm">
                    <Search className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Part Number Lookup</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm">
                    <FileText className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Datasheet Extraction</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">Risk Assessment</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-sm">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-muted-foreground">FFF Analysis</span>
                </div>
            </div>
        </div>
    );
}
