
"use server";
import { db } from "./db";
import { usersTable } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const { name, age, email } = await request.json();
    await db.insert(usersTable).values({ name, age, email });
    return new Response("User created", { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error creating user", { status: 500 });
  }
}