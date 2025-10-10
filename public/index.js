const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const QRCode = require("qrcode");
require("dotenv").config();

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// Test route
app.get("/", (req, res) => {
  res.send("✅ IntelliPark backend running!");
});

// Create invoice (simplified version)
app.post("/api/create-invoice", async (req, res) => {
  try {
    console.log("Received request body:", req.body);
    
    const { slot, name, plate, vehicle, email, time } = req.body;

    // Enhanced validation with specific error messages
    if (!slot) {
      console.error("Missing slot parameter");
      return res.status(400).json({ error: "Missing slot parameter" });
    }
    
    if (!email) {
      console.error("Missing email parameter");
      return res.status(400).json({ error: "Missing email parameter" });
    }
    
    if (!name || !plate || !vehicle || !time) {
      console.error("Missing required booking details");
      return res.status(400).json({ error: "Missing required booking details: name, plate, vehicle, or time" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format");
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate plate format (ABC123)
    const plateRegex = /^[A-Za-z]{3}[0-9]{3}$/;
    if (!plateRegex.test(plate)) {
      console.error("Invalid plate format");
      return res.status(400).json({ error: "Plate number must be in format ABC123" });
    }

    console.log(`Creating invoice for ${email}, slot ${slot}`);

    // Simulate invoice creation (replace with real Xendit call later)
    const invoiceData = {
      invoice_url: "https://checkout.xendit.co/web/1234567890",
      slot,
      name,
      plate,
      vehicle,
      email,
      time
    };

    console.log("Invoice created successfully:", invoiceData);
    res.json(invoiceData);
    
  } catch (error) {
    console.error("Error creating invoice:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});