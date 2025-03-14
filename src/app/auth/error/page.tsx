"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
          Authentication Error
        </h2>
        
        <div className="text-gray-600 text-center mb-6">
          {error === "AccessDenied" && (
            <p>You do not have permission to sign in.</p>
          )}
          {error === "Configuration" && (
            <p>There is a problem with the server configuration.</p>
          )}
          {error === "OAuthSignin" && (
            <p>Error occurred while signing in with OAuth provider.</p>
          )}
          {!error && (
            <p>An unknown error occurred during authentication.</p>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
