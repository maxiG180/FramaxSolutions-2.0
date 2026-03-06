'use client';

type BrandKitHeaderProps = {
  syncEnabled: boolean;
  onSyncToggle: () => void;
};

export default function BrandKitHeader({ syncEnabled, onSyncToggle }: BrandKitHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#222] bg-[#0d0d0d] px-8 py-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-6xl font-display tracking-wide">
            FRAMAX<span className="text-[#2563eb]">.</span>
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[#555]">
            Brand Kit Comparison Tool
          </p>
        </div>
        <button
          onClick={onSyncToggle}
          aria-label={`Toggle tab synchronization: currently ${syncEnabled ? 'enabled' : 'disabled'}`}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 font-mono text-xs transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-[#0d0d0d] ${
            syncEnabled
              ? 'border-[#2563eb]/30 bg-[#2563eb]/10 text-[#3b82f6]'
              : 'border-[#2e2e2e] bg-transparent text-[#a0a0a0] hover:border-[#444] hover:bg-[#1c1c1c]'
          }`}
        >
          <span aria-hidden="true">🔗</span>
          <span>Sync Tabs: {syncEnabled ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </header>
  );
}
