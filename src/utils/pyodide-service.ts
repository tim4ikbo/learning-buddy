'use client';

// This file contains client-side only code for Pyodide integration

// Type definitions for Pyodide interface - permissive to match Pyodide API
interface PyodideInterface {
  runPython: (code: string) => any;
  runPythonAsync: (code: string) => Promise<any>;
  loadPackagesFromImports: (imports: string) => Promise<any>;
}

// Track the Pyodide instance and loading state (singleton pattern)
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

// Maximum execution time for Python code (ms)
const MAX_EXECUTION_TIME = 5000;

/**
 * Initialize Pyodide and return the instance
 * Loads the Pyodide script, sets up the environment, and caches the instance.
 * Ensures only one instance is loaded and only on the client side.
 */
export async function initPyodide(): Promise<PyodideInterface> {
  // If already loaded, return the instance
  if (pyodideInstance) return pyodideInstance as PyodideInterface;
  
  // If currently loading, return the loading promise
  if (pyodideLoading) return pyodideLoading;
  
  // Start loading Pyodide
  pyodideLoading = (async () => {
    try {
      console.log('Loading Pyodide...');
      
      // Make sure we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Pyodide can only be loaded in a browser environment');
      }
      
      // Load the Pyodide script directly using a script tag
      await loadPyodideScript();
      
      // Access the global loadPyodide function that was loaded via the script tag
      // @ts-ignore - loadPyodide is loaded globally by the script
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/',
      });
      
      console.log('Pyodide loaded successfully');
      
      // Try to load some useful packages
      try {
        await pyodide.loadPackagesFromImports('numpy');
        console.log('NumPy loaded successfully');
      } catch (packageError) {
        console.warn('Failed to load NumPy:', packageError);
        // Continue even if package loading fails
      }
      
      // Store the instance and return it
      pyodideInstance = pyodide;
      return pyodide;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      // Reset loading state so we can try again
      pyodideLoading = null;
      throw error;
    }
  })();
  
  return pyodideLoading;
}

/**
 * Load the Pyodide script via a script tag
 */
function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if the script is already loaded
    if (window.loadPyodide) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
}

/**
 * Execute Python code with safety measures
 * @param code The Python code to execute
 * @returns Object containing result, error, stdout, and stderr
 */
export async function runPythonCode(code: string): Promise<{
  result: string;
  error: string | null;
  stdout: string;
  stderr: string;
}> {
  try {
    // Make sure we're in a browser environment
    if (typeof window === 'undefined') {
      throw new Error('Python code can only be executed in a browser environment');
    }
    
    // Initialize Pyodide if not already done
    const pyodide = await initPyodide() as PyodideInterface;
    
    // Reset stdout and stderr
    pyodide.runPython(`
      import sys
      import io
      sys.stdout = io.StringIO()
      sys.stderr = io.StringIO()
    `);
    
    // Set up timeout for execution
    const executionPromise = pyodide.runPythonAsync(code);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timed out after ${MAX_EXECUTION_TIME}ms`));
      }, MAX_EXECUTION_TIME);
    });
    
    // Race between execution and timeout
    const result = await Promise.race([executionPromise, timeoutPromise]);
    
    // Capture stdout and stderr
    const stdout = pyodide.runPython("sys.stdout.getvalue()").toString();
    const stderr = pyodide.runPython("sys.stderr.getvalue()").toString();
    
    return {
      result: result?.toString() || '',
      error: null,
      stdout,
      stderr
    };
  } catch (error) {
    console.error('Python execution error:', error);
    
    try {
      // Try to capture stderr even if there was an error
      const pyodide = await initPyodide() as PyodideInterface;
      const stderr = pyodide.runPython("sys.stderr.getvalue()").toString();
      const stdout = pyodide.runPython("sys.stdout.getvalue()").toString();
      
      return {
        result: '',
        error: (error as Error).message,
        stdout,
        stderr
      };
    } catch {
      // If we can't even get stderr, just return the error message
      return {
        result: '',
        error: (error as Error).message,
        stdout: '',
        stderr: ''
      };
    }
  }
}

// Add this to the global Window interface
declare global {
  interface Window {
    loadPyodide?: (config?: {indexURL?: string}) => Promise<PyodideInterface>;
  }
}

/**
 * Reset the Pyodide environment
 */
export function resetPyodide(): void {
  pyodideInstance = null;
  pyodideLoading = null;
}
