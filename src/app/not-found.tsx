import Link from 'next/link';
import { ArrowLeft, Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFF9F2] text-[#0D2319] px-4 selection:bg-emerald-200">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-[#0D2319] mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-sm text-gray-600 mb-6">
          The diagnostic page or record you are looking for does not exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/portal"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm transition-all shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Choose Portal</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
