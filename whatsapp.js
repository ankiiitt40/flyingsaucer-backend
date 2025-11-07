// whatsapp.js
import twilio from "twilio";

const accountSid = process.env.TWILIO_SID;  // Twilio SID from .env
const authToken = process.env.TWILIO_AUTH_TOKEN;  // Twilio token from .env
const client = twilio(accountSid, authToken);
const fromWhatsAppNumber = "whatsapp:+14155238886"; // Twilio sandbox number

export const sendWhatsApp = async (to, message) => {
  try {
    const toWhatsAppNumber = `whatsapp:${to}`;
    await client.messages.create({
      from: fromWhatsAppNumber,
      body: message,
      to: toWhatsAppNumber,
    });
    console.log("✅ WhatsApp sent to", to);
  } catch (err) {
    console.error("❌ WhatsApp send error:", err);
  }
};
