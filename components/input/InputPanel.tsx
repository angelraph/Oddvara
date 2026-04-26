'use client';

import { useRef, useState, useCallback } from 'react';
import { Hash, FileText, ImageIcon, ArrowRight, RotateCcw, ChevronDown } from 'lucide-react';
import { cleanOcrText } from '@/lib/parser/ocrCleaner';
import { Button, Spinner } from '@/components/ui';
import { useSlipStore } from '@/store/useSlipStore';
import { SAMPLE_SLIPS } from '@/data/sampleSlips';
import type { InputMethod } from '@/types';

interface TabConfig {
  id: InputMethod;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
}

const TABS: TabConfig[] = [
  {
    id: 'code',
    label: 'Booking Code',
    icon: <Hash className="w-4 h-4" />,
    placeholder: 'Enter your booking code, e.g. SB789432 or B9J445521',
  },
  {
    id: 'text',
    label: 'Paste Slip',
    icon: <FileText className="w-4 h-4" />,
    placeholder: `Paste your full bet slip here. Example:\n\nArsenal vs Chelsea\nFull Time Result - Arsenal Win\nOdds: 2.20\n\nBarcelona vs Real Madrid\nOver 2.5 Goals\nOdds: 1.85`,
  },
  {
    id: 'screenshot',
    label: 'Screenshot',
    icon: <ImageIcon className="w-4 h-4" />,
    placeholder: '',
  },
];

export function InputPanel() {
  const {
    inputMethod,
    inputValue,
    isLoading,
    isParsing,
    isConverting,
    ocrProgress,
    parsedSlip,
    setInputMethod,
    setInputValue,
    setOcrProgress,
    parseSlip,
    reset,
  } = useSlipStore();

  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showSamples, setShowSamples] = useState(false);

  const activeTab = TABS.find((t) => t.id === inputMethod) ?? TABS[1];

  const handleSubmit = useCallback(async () => {
    await parseSlip(inputValue, inputMethod);
  }, [inputValue, inputMethod, parseSlip]);

  const handleReset = useCallback(() => {
    reset();
    setImagePreview(null);
  }, [reset]);

  const processImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setInputValue('');
      setOcrProgress(0);

      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng', 1, {
          logger: (m: { status: string; progress: number }) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          },
        });
        const result = await worker.recognize(file);
        await worker.terminate();
        setInputValue(cleanOcrText(result.data.text));
        setOcrProgress(100);
      } catch {
        setInputValue('OCR failed. Please paste the slip text manually.');
      }
    },
    [setInputValue, setOcrProgress]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processImageFile(file);
    },
    [processImageFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processImageFile(file);
    },
    [processImageFile]
  );

  const loadSample = useCallback(
    (sampleContent: string) => {
      setInputValue(sampleContent);
      setInputMethod('text');
      setShowSamples(false);
    },
    [setInputValue, setInputMethod]
  );

  if (parsedSlip) {
    return (
      <div className="flex justify-center">
        <Button variant="secondary" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-4 h-4" />}>
          Parse another slip
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex p-1 bg-ov-surface border border-ov-border rounded-2xl gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setInputMethod(tab.id); setImagePreview(null); setInputValue(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-150 ${
              inputMethod === tab.id
                ? 'bg-ov-card text-ov-text shadow-card border border-ov-border'
                : 'text-ov-muted hover:text-ov-text'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-ov-card border border-ov-border rounded-2xl overflow-hidden">
        {inputMethod === 'screenshot' ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center p-12 cursor-pointer transition-colors ${
              dragOver ? 'bg-ov-green/5 border-ov-green/30' : 'hover:bg-ov-elevated'
            }`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            {imagePreview ? (
              <div className="w-full max-w-sm space-y-4">
                <img src={imagePreview} alt="Preview" className="w-full rounded-xl border border-ov-border" />
                {ocrProgress > 0 && ocrProgress < 100 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-ov-muted">
                      <span>Extracting text...</span>
                      <span>{ocrProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-ov-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ov-green rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {ocrProgress === 100 && (
                  <p className="text-center text-sm text-ov-green font-medium">Text extracted — ready to parse</p>
                )}
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-ov-elevated border border-ov-border flex items-center justify-center mb-4">
                  <ImageIcon className="w-7 h-7 text-ov-muted" />
                </div>
                <p className="text-ov-text font-medium mb-1">Drop your screenshot here</p>
                <p className="text-ov-muted text-sm">or click to browse — PNG, JPG supported</p>
              </>
            )}
          </div>
        ) : (
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={activeTab.placeholder}
            rows={inputMethod === 'code' ? 2 : 8}
            className="w-full bg-transparent px-5 py-4 text-ov-text placeholder-ov-faint text-sm font-mono resize-none focus:outline-none leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleSubmit();
            }}
          />
        )}

        <div className="border-t border-ov-border px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-1.5 text-xs text-ov-muted hover:text-ov-text transition-colors"
            >
              Try an example
              <ChevronDown className={`w-3 h-3 transition-transform ${showSamples ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {inputValue && (
              <button onClick={() => { setInputValue(''); setImagePreview(null); }} className="text-xs text-ov-muted hover:text-ov-red transition-colors">
                Clear
              </button>
            )}
            <Button
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!inputValue.trim() && !imagePreview}
              size="sm"
              leftIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
            >
              {isParsing ? 'Parsing...' : isConverting ? 'Converting...' : 'Convert Bet'}
            </Button>
          </div>
        </div>
      </div>

      {/* Sample Slips Dropdown */}
      {showSamples && (
        <div className="bg-ov-card border border-ov-border rounded-2xl overflow-hidden animate-slide-up">
          <div className="px-4 py-3 border-b border-ov-border">
            <p className="text-xs font-medium text-ov-muted uppercase tracking-wider">Sample Slips</p>
          </div>
          {SAMPLE_SLIPS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => loadSample(sample.content)}
              className="w-full px-4 py-3 text-left hover:bg-ov-elevated transition-colors border-b border-ov-border last:border-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ov-text">{sample.label}</span>
                <span className="text-xs text-ov-muted capitalize px-2 py-0.5 bg-ov-elevated rounded-md">{sample.platform}</span>
              </div>
              <p className="text-xs text-ov-muted mt-0.5 truncate">{sample.content.split('\n')[0]}</p>
            </button>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-ov-faint">
        Press <kbd className="px-1.5 py-0.5 bg-ov-elevated rounded text-ov-muted">⌘ Enter</kbd> to parse
      </p>
    </div>
  );
}
