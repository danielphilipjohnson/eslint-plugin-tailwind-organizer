export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Next.js Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          This page tests the ESLint plugin with Next.js.
        </p>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}

