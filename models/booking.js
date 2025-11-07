import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  guests: { type: Number, required: true },
  date: { type: String, required: true },
  meal: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
