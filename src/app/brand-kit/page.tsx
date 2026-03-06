import { redirect } from 'next/navigation';

export default function BrandKitPage() {
  if (process.env.NODE_ENV !== 'development') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <h1 className="p-8 text-4xl">Brand Kit Comparison</h1>
    </div>
  );
}
