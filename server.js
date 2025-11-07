// server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookingsRoutes from "./routes/booking.js";
import Booking from "./models/booking.js";
import twilio from "twilio";
import nodemailer from "nodemailer";
import verifyToken from "./middleware/auth.js";

dotenv.config();

const app = express();

// ======================
// 🔹 CORS Setup
// ======================
const allowedOrigins = [
  "http://localhost:5173",                       // local dev
"https://flyingsaucercafeandbar1.netlify.app",          // your deployed frontend
];


app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // Postman, curl, mobile apps
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error("CORS policy does not allow this origin."), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());

// ======================
// 🔹 MongoDB Connection
// ======================
console.log("Connecting to MongoDB...");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ======================
// 🔹 Twilio Setup (WhatsApp)
// ======================
const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// ======================
// 🔹 Nodemailer Setup (Email)
// ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================
// 🔹 Helper Functions
// ======================
async function sendWhatsApp(to, message) {
  try {
    await twilioClient.messages.create({
      from: "whatsapp:+14155238886", // Twilio Sandbox WhatsApp number
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log(`✅ WhatsApp message sent to ${to}`);
  } catch (error) {
    console.error("❌ WhatsApp send error:", error.message);
  }
}

async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email send error:", error.message);
  }
}

// ======================
// 🔹 Routes
// ======================
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// Auth & Bookings routes
app.use("/api/auth", authRoutes);
app.use("/api", bookingsRoutes);

// ======================
// 🔹 Direct Booking + Notifications
// ======================
app.post("/api/book", async (req, res) => {
  try {
    const { guests, date, meal, time, name, email, phone } = req.body;

    if (!guests || !date || !meal || !time || !name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const booking = new Booking({
      guests: Number(guests),
      date,
      meal,
      time,
      name,
      email,
      phone,
    });

    await booking.save();

    const confirmationMsg = `Hi ${name}, your booking for ${date} at ${time} (${meal}) for ${guests} guests is confirmed! 🍽️`;

    // Notifications
    sendWhatsApp(phone, confirmationMsg);
    sendEmail(email, "Booking Confirmation", confirmationMsg);

    res.json({ message: "✅ Booking saved and notifications sent!" });
  } catch (err) {
    console.error("❌ Booking save error:", err);
    res.status(500).json({ message: "Booking failed!" });
  }
});

// ======================
// 🔹 Protected Route (JWT Test)
// ======================
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, you're authorized ✅` });
});

// ======================
// 🔹 Start Server
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
