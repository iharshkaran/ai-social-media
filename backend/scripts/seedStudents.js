import "../src/config/loadEnv.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../src/models/User.js";

if (process.env.NODE_ENV !== "development") {
  throw new Error("Demo students can only be seeded when NODE_ENV=development.");
}

const demoPassword = "DemoStudent123!";
const names = [
  "Aarav Mehta", "Ananya Sharma", "Kabir Verma", "Isha Kapoor",
  "Vivaan Patel", "Diya Nair", "Arjun Rao", "Meera Joshi",
  "Reyansh Gupta", "Sana Khan", "Aditya Reddy", "Kiara Das",
  "Ishaan Malhotra", "Myra Singh", "Dev Shah", "Aadhya Iyer",
  "Rohan Kulkarni", "Tara Bose", "Neil Fernandes", "Zoya Ali",
  "Kunal Bhat", "Avni Chawla", "Siddharth Menon", "Riya Sethi",
];
const courses = ["B.Tech CSE", "B.Tech IT", "BCA", "B.Tech AI/ML"];
const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const universities = [
  "North Valley Institute of Technology",
  "Riverdale College of Engineering",
  "Horizon School of Computing",
  "Greenfield University",
  "Summit Institute of Science",
  "Lakeside Technical University",
];
const locations = ["Delhi", "Mumbai", "Bengaluru", "Pune", "Hyderabad", "Jaipur", "Chennai", "Lucknow"];
const skills = [
  ["React", "JavaScript", "UI Design"],
  ["Python", "Machine Learning", "SQL"],
  ["Java", "Data Structures", "Git"],
  ["Node.js", "MongoDB", "Express"],
  ["Figma", "HTML", "CSS"],
  ["C++", "Problem Solving", "Algorithms"],
];

const passwordHash = await bcrypt.hash(demoPassword, 12);
const operations = names.map((name, index) => {
  const course = courses[index % courses.length];
  const year = years[Math.floor(index / courses.length) % years.length];
  const focus = skills[index % skills.length];
  const emailNumber = String(index + 1).padStart(2, "0");
  return {
    updateOne: {
      filter: { email: `student${emailNumber}@demo.connectly.test` },
      update: {
        $setOnInsert: {
          name,
          email: `student${emailNumber}@demo.connectly.test`,
          passwordHash,
          headline: `${course} student · ${focus[0]} enthusiast`,
          university: universities[index % universities.length],
          course,
          year,
          location: locations[index % locations.length],
          bio: `Demo student profile for Connectly testing. Interested in ${focus.join(", ")}.`,
          skills: focus,
          photo: "",
          portfolioUrl: "",
        },
      },
      upsert: true,
    },
  };
});

try {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in backend/.env first.");
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const result = await User.bulkWrite(operations, { ordered: false });
  console.log(`Demo students ready: ${names.length}. Newly added: ${result.upsertedCount}. Existing demo accounts kept unchanged.`);
  console.log(`Demo login password for seeded accounts: ${demoPassword}`);
} catch (error) {
  if (error.name === "MongooseServerSelectionError") {
    console.error("Could not reach MongoDB from this environment. Run this seed command on the computer where your backend already connects to the database.");
    process.exitCode = 1;
  } else {
    throw error;
  }
} finally {
  await mongoose.disconnect();
}
