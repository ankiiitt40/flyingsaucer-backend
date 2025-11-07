// routes/bookings.js
import express from "express";
import Booking from "../models/booking.js";
import { sendWhatsApp } from "../whatsapp.js";
import { sendEmail } from "../email.js";

const router = express.Router();

// POST /api/book
router.post("/book", async (req, res) => {
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

    // send WhatsApp + Email
    sendWhatsApp(phone, confirmationMsg);
    sendEmail(email, "Booking Confirmation", confirmationMsg);

    res.json({ message: "✅ Booking saved and notifications sent!" });
  } catch (err) {
    console.error("❌ Booking save error:", err);
    res.status(500).json({ message: "Booking failed!" });
  }
});

export default router;
