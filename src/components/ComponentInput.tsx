import { useState } from 'react';
import { Search, Upload, ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ComponentInputProps {
    onPartNumberSubmit: (partNumber: string) => void;
    onDatasheetUpload: (file: File) => void;
    isLoading?: boolean;
}

export function ComponentInput({ onPartNumberSubmit, onDatasheetUpload, isLoading }: ComponentInputProps) {
    const [partNumber, setPartNumber] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (partNumber.trim()) {
            onPartNumberSubmit(partNumber.trim());
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
        }
    };

    const handleUploadSubmit = () => {
        if (uploadedFile) {
            onDatasheetUpload(uploadedFile);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            {/* Part Number Input */}
            <div className="engineering-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-accent" />
                    <h2 className="font-semibold text-foreground">Enter Component Part Number</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="e.g., LM7805CT, TPS54331, MC78M05"
                            value={partNumber}
                            onChange={(e) => setPartNumber(e.target.value)}
                            className="font-mono text-base h-12 pr-12"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!partNumber.trim() || isLoading}
                        className="w-full h-11 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                                Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Find Replacements
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </Button>
                </form>
            </div>

            <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground uppercase tracking-wide">or</span>
                <div className="h-px flex-1 bg-border" />
            </div>

            {/* Datasheet Upload */}
            <div className="engineering-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Upload className="w-5 h-5 text-accent" />
                    <h2 className="font-semibold text-foreground">Upload Datasheet (PDF)</h2>
                </div>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                        'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                        dragActive ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50',
                        uploadedFile && 'border-success bg-success/5'
                    )}
                >
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="datasheet-upload"
                        disabled={isLoading}
                    />
                    <label htmlFor="datasheet-upload" className="cursor-pointer">
                        {uploadedFile ? (
                            <div className="flex flex-col items-center gap-2">
                                <FileText className="w-10 h-10 text-success" />
                                <p className="font-medium text-success">{uploadedFile.name}</p>
                                <p className="text-sm text-muted-foreground">Click to change file</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-10 h-10 text-muted-foreground" />
                                <p className="text-muted-foreground">
                                    Drag & drop a PDF datasheet here, or click to browse
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Supports PDF files up to 10MB
                                </p>
                            </div>
                        )}
                    </label>
                </div>

                {uploadedFile && (
                    <Button
                        onClick={handleUploadSubmit}
                        disabled={isLoading}
                        className="w-full h-11 mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                                Extracting Specifications...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Extract Specifications
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
