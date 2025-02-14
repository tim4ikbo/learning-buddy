"use client";
import { createUser } from "@/api/create_user";
import { useState } from "react";

export default function Home() {
  
  return (
    <div>
    <h1>learning buddy </h1>
    <button className = "rounded border p-4 bg-slate-500" onClick={() => createUser("timofey",18,"timogey")}>Click me</button>
    </div>
  );
}
