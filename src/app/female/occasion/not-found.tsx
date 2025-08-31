import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1414] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Occasion Not Found</h2>
        <p className="text-gray-300 mb-8">The occasion you&apos;re looking for doesn&apos;t exist.</p>
        <Link 
          href="/female" 
          className="inline-block bg-white text-[#1a1414] px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
        >
          Back to Female Section
        </Link>
      </div>
    </div>
  );
}
