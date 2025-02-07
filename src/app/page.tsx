"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const[counter, setCounter] = useState(0);
  return (
    <div>
    <h1>learning buddy {counter}</h1>
    <button className = "rounded border p-4 bg-slate-500" onClick={() => setCounter(counter + 1)}>Click me</button>
    </div>
  );
}
