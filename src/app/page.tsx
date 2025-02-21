"use client";
export default function Home() {
  const handleClick = async () => {
    const res = await fetch("/api/create_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "timofey", age: 18, email: "timogey" }),
    });
    console.log(await res.text());
  };

  return (
    <div>
      <h1>learning buddy</h1>
      <button
        className="rounded border p-4 bg-slate-500"
        onClick={handleClick}
      >
        Click me
      </button>
    </div>
  );
}