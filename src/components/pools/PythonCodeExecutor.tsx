"use client"

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Type definition for Pyodide execution result
// Import types only for TypeScript (not included in the bundle)
type PyodideResult = {
  result: string;
  error: string | null;
  stdout: string;
  stderr: string;
};

// Pyodide code execution function (dynamically loaded at runtime)
let runPythonCode: (code: string) => Promise<PyodideResult>;

// Props for PythonCodeExecutor: Python code to run and close handler
interface PythonCodeExecutorProps {
  code: string;
  onClose: () => void;
}

// Component for executing Python code using Pyodide in the browser
export const PythonCodeExecutor: React.FC<PythonCodeExecutorProps> = ({ code, onClose }) => {
  // State for execution and loading indicators, and execution result
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<{
    result: string;
    error: string | null;
    stdout: string;
    stderr: string;
  } | null>(null);
  
  // Dynamically load the Pyodide service module and initialize Pyodide
  useEffect(() => {
    const loadPyodideModule = async () => {
      try {
        // Import the module dynamically
        const pyodideService = await import("@/utils/pyodide-service");
        
        // Assign the functions
        runPythonCode = pyodideService.runPythonCode;
        
        // Initialize Pyodide
        await pyodideService.initPyodide();
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
      }
    };

    loadPyodideModule();
  }, []);

  const executeCode = async () => {
    if (isExecuting || isLoading || !runPythonCode) return;
    
    setIsExecuting(true);
    try {
      const executionResult = await runPythonCode(code);
      setResult(executionResult);
    } catch (error) {
      setResult({
        result: '',
        error: (error as Error).message,
        stdout: '',
        stderr: 'Failed to execute code'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Python Code Execution</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 overflow-auto bg-gray-100 p-4 rounded-md">
          <pre className="text-sm"><code>{code}</code></pre>
        </div>
        
        {isLoading ? (
          <div className="flex items-center gap-2 text-blue-600 mb-4">
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Loading Python interpreter...</span>
          </div>
        ) : (
          <>
            {!result && !isExecuting && (
              <button
                onClick={executeCode}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mb-4"
              >
                Run Code
              </button>
            )}
            
            {isExecuting && (
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Executing code...</span>
              </div>
            )}
          </>
        )}
        
        {result && (
          <div className="flex-1 overflow-auto">
            {result.error ? (
              <div className="mb-4">
                <h4 className="font-medium text-red-600 mb-2">Error:</h4>
                <pre className="bg-red-50 p-3 rounded text-red-800 text-sm overflow-auto">{result.error}</pre>
              </div>
            ) : result.result ? (
              <div className="mb-4">
                <h4 className="font-medium text-green-600 mb-2">Result:</h4>
                <pre className="bg-green-50 p-3 rounded text-green-800 text-sm overflow-auto">{result.result}</pre>
              </div>
            ) : null}
            
            {result.stdout && (
              <div className="mb-4">
                <h4 className="font-medium text-blue-600 mb-2">Standard Output:</h4>
                <pre className="bg-blue-50 p-3 rounded text-blue-800 text-sm overflow-auto whitespace-pre-wrap">{result.stdout}</pre>
              </div>
            )}
            
            {result.stderr && !result.error && (
              <div className="mb-4">
                <h4 className="font-medium text-orange-600 mb-2">Standard Error:</h4>
                <pre className="bg-orange-50 p-3 rounded text-orange-800 text-sm overflow-auto">{result.stderr}</pre>
              </div>
            )}
            
            <button
              onClick={executeCode}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mt-2"
            >
              Run Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PythonCodeExecutor;
