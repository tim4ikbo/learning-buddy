"use server";
import { db } from "./db";
import { usersTable } from "@/db/schema";

export async function createUser(name: string, age: number, email: string) {
    await db.insert(usersTable).values({name:name,age:age,email:email})
    
    
}