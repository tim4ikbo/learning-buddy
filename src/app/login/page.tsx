"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from 'next/navigation';
import { FaGithub, FaGoogle } from "react-icons/fa";

// Login page component for user authentication
export default function LoginPage() {
  // Get URL search parameters to determine mode (login/signup)
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  // State for loading indicator and error messages
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle OAuth sign-in for Google or GitHub
  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setIsLoading(true);
      setError("");
      await signIn(provider, { callbackUrl: "/pools" }); // Redirect after successful sign-in
    } catch (error) {
      setError("An error occurred during sign in. Please try again.");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Render the login/signup UI with OAuth buttons
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h2>

        <div className="space-y-4">
          {/* Google Sign In */}
          <button
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGoogle className="w-5 h-5 text-red-500" />
            <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
          </button>

          {/* GitHub Sign In */}
          <button
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaGithub className="w-5 h-5" />
            <span>{mode === 'signup' ? 'Sign up with GitHub' : 'Continue with GitHub'}</span>
          </button>

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center mt-4">{error}</div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-gray-500 text-sm text-center mt-4">
              Signing in...
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}
