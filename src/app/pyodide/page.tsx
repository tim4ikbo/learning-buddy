"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Type definition for Pyodide execution result
// Import types only for TypeScript
// (not included in the bundle)
type PyodideResult = {
  result: string;
  error: string | null;
  stdout: string;
  stderr: string;
};

// Pyodide initialization and code execution functions
// (loaded dynamically at runtime)
let initPyodide: () => Promise<any>;
let runPythonCode: (code: string) => Promise<PyodideResult>;

// Example Python code snippets for demonstration
const EXAMPLE_CODES = [
  {
    name: "Basic Calculation",
    code: "2 + 2 * 10"
  },
  {
    name: "Hello World",
    code: "print('Hello, world!')"
  },
  {
    name: "List Manipulation",
    code: "numbers = [1, 2, 3, 4, 5]\nprint(f'Original list: {numbers}')\nsquared = [x**2 for x in numbers]\nprint(f'Squared: {squared}')"
  },
  {
    name: "Simple Function",
    code: "def greet(name):\n    return f'Hello, {name}!'\n\nresult = greet('Learning Buddy')\nprint(result)"
  },
  {
    name: "NumPy Example",
    code: "import numpy as np\n\narr = np.array([1, 2, 3, 4, 5])\nprint(f'Array: {arr}')\nprint(f'Mean: {np.mean(arr)}')\nprint(f'Standard deviation: {np.std(arr)}')"
  }
];

// Pyodide interactive test page for running Python code in-browser
export default function PyodideTestPage() {
  // State for Pyodide loading, code input, execution result, and running indicator
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState(EXAMPLE_CODES[0].code);
  const [result, setResult] = useState<{
    result: string;
    error: string | null;
    stdout: string;
    stderr: string;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    // Dynamically import the module only on the client side
    const loadPyodideModule = async () => {
      try {
        // Import the module dynamically
        const pyodideService = await import("@/utils/pyodide-service");
        
        // Assign the functions
        initPyodide = pyodideService.initPyodide;
        runPythonCode = pyodideService.runPythonCode;
        
        // Initialize Pyodide
        await initPyodide();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
      }
    };

    loadPyodideModule();
  }, []);

  const executeCode = async () => {
    if (isExecuting || !runPythonCode) return;

    setIsExecuting(true);
    try {
      const executionResult = await runPythonCode(code);
      setResult(executionResult);
    } catch (error) {
      setResult({
        result: "",
        error: (error as Error).message,
        stdout: "",
        stderr: "Failed to execute code",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Python Code Execution Demo</h1>
      <p className="mb-6">
        This page demonstrates how Python code can be executed directly in the browser using Pyodide.
        The same functionality is available in the Pool Canvas when adding Python code text items.
      </p>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
          <p className="text-lg">Loading Python interpreter...</p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a moment as we're downloading and initializing the Python environment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-4">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Python Code
              </label>
              <textarea
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 p-4 border rounded-md font-mono text-sm bg-gray-50"
              />
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={executeCode}
                disabled={isExecuting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Executing...
                  </>
                ) : (
                  "Run Code"
                )}
              </button>
            </div>

            {result && (
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 font-medium border-b">
                  Execution Results
                </div>
                <div className="p-4">
                  {result.error ? (
                    <div className="mb-4">
                      <h4 className="font-medium text-red-600 mb-2">Error:</h4>
                      <pre className="bg-red-50 p-3 rounded text-red-800 text-sm overflow-auto">
                        {result.error}
                      </pre>
                    </div>
                  ) : result.result ? (
                    <div className="mb-4">
                      <h4 className="font-medium text-green-600 mb-2">Result:</h4>
                      <pre className="bg-green-50 p-3 rounded text-green-800 text-sm overflow-auto">
                        {result.result}
                      </pre>
                    </div>
                  ) : null}

                  {result.stdout && (
                    <div className="mb-4">
                      <h4 className="font-medium text-blue-600 mb-2">Standard Output:</h4>
                      <pre className="bg-blue-50 p-3 rounded text-blue-800 text-sm overflow-auto whitespace-pre-wrap">
                        {result.stdout}
                      </pre>
                    </div>
                  )}

                  {result.stderr && !result.error && (
                    <div className="mb-4">
                      <h4 className="font-medium text-orange-600 mb-2">Standard Error:</h4>
                      <pre className="bg-orange-50 p-3 rounded text-orange-800 text-sm overflow-auto">
                        {result.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Example Code Snippets</h3>
            <div className="space-y-3">
              {EXAMPLE_CODES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setCode(example.code)}
                  className="block w-full text-left p-3 border rounded-md hover:bg-gray-50"
                >
                  <span className="font-medium">{example.name}</span>
                  <pre className="mt-2 text-xs text-gray-600 overflow-hidden line-clamp-2">
                    {example.code.split("\n").slice(0, 2).join("\n")}
                    {example.code.split("\n").length > 2 && "..."}
                  </pre>
                </button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">About Pyodide</h4>
              <p className="text-sm text-blue-700 mb-2">
                Pyodide is a Python distribution for the browser based on WebAssembly. It allows
                running Python code directly in the browser without any server-side processing.
              </p>
              <p className="text-sm text-blue-700">
                In the Pool Canvas, you can add Python code that can be executed by double-clicking
                on the text item. This is useful for creating interactive learning materials.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
