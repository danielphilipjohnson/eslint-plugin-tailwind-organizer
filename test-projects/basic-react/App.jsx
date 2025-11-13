function App() {
  return (
    <div>
      {/* Test case 1: Unorganized classes */}
      <div className="mt-4 flex flex-col items-center justify-center text-center md:mt-0 md:flex-row">
        <h1>Hello World</h1>
      </div>

      {/* Test case 2: Mixed spacing and background */}
      <button className="rounded-md bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
        Click me
      </button>

      {/* Test case 3: Complex layout */}
      <div className="fixed inset-x-0 top-0 z-10 min-h-[40px] bg-white py-4 shadow-lg sm:pb-2">
        <nav className="mx-auto max-w-7xl px-4">Navigation</nav>
      </div>

      {/* Test case 4: Already organized (should pass) */}
      <div className="flex items-center justify-center mt-4">
        Already organized
      </div>

      {/* Test case 5: Single quotes */}
      <div className="text-sm font-medium text-gray-900">
        Single quotes test
      </div>
    </div>
  );
}

export default App;
