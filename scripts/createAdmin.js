// scripts/createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../lib/models.js";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;
console.log(MONGO_URI);
console.log(process.env.MONGODB_URI);
async function createAdmin() {
  await mongoose.connect(MONGO_URI);

  const phone = "8449173077";
  const plainPassword = "Aman@8449";

  const adminExists = await User.findOne({ phone });
  if (adminExists) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await User.create({
    phone,
    password: hashedPassword,
  });

  console.log("Admin created successfully");
  process.exit(0);
}

createAdmin();
