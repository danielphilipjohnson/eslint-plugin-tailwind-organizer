import React from "react";

const App: React.FC = () => {
  return (
    <div>
      {/* Test case: TypeScript with unorganized classes */}
      <div className="mt-8 flex flex-col items-start justify-start space-y-4 p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          TypeScript Test
        </h1>
        <p className="text-gray-600 text-base leading-relaxed">
          Testing the plugin with TypeScript.
        </p>
        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-all duration-200"
          onClick={() => console.log("clicked")}
        >
          TypeScript Button
        </button>
      </div>
    </div>
  );
};

export default App;

