import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Brand Kit Comparison | Dev Only',
  description: 'Internal brand kit development and comparison tool',
  robots: { index: false, follow: false },
};

export default function BrandKitPage() {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4">
        <p className="text-yellow-200 text-sm font-mono">
          ⚠️ DEV ONLY - This page is not accessible in production
        </p>
      </div>
      <h1 className="p-8 text-4xl">Brand Kit Comparison</h1>
    </main>
  );
}
