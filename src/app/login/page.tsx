"use client";
import { useState } from "react";
import { createUser } from "@/api/create_user";

export default function SignUpPage() {
  // State for form inputs and error messages
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [alert, setAlert] = useState("");

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate that all fields are filled
    if (!nickname || !age || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      // Call the server-side function to create the user, passing the plain-text password
      await createUser(nickname, parseInt(age), email, password);
      setError(""); // Clear any previous errors
      setAlert("Account created successfully!"); // Simple success feedback
      // Reset form fields
      setNickname("");
      setAge("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      
    } catch (err) {
      let errorMessage = "Failed to create account. Email may already be in use.";
    if (err instanceof Error) {
      if (err.message.includes("UNIQUE constraint failed")) {
        errorMessage = "This email is already registered.";
      } else {
        errorMessage = `An error occurred: ${err.message}`;
      }
    }
    setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-96 border border-blue-500">
        {/* Header */}
        <h2 className="text-white text-2xl font-bold mb-6 text-center">
          Sign Up to Study Sphere
        </h2>

        {/* Sign-up form */}
        <form onSubmit={handleSubmit}>
          {/* Nickname Field */}
          <div className="mb-4">
            <label
              className="block text-white mb-2"
              htmlFor="nickname"
            >
              Nickname
            </label>
            <input
              type="text"
              id="nickname"
              className="w-full p-2 rounded-lg bg-white text-black border border-gray-500"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Age Field */}
          <div className="mb-4">
            <label
              className="block text-white mb-2"
              htmlFor="age"
            >
              Age
            </label>
            <input
              type="number"
              id="age"
              className="w-full p-2 rounded-lg bg-white text-black border border-gray-500"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              className="block text-white mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 rounded-lg bg-white text-black border border-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              className="block text-white mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 rounded-lg bg-white text-black border border-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label
              className="block text-white mb-2"
              htmlFor="confirmPassword"
            >
              Confirm password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="w-full p-2 rounded-lg bg-white text-black border border-gray-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          {/* Success Message */}
          {alert && <p className="text-green-500 mb-4 text-center">{alert}</p>}
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white p-2 rounded-full font-bold"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}