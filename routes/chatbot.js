const express = require("express");
const router = express.Router();

// helper: keyword match
function match(msg, keywords) {
  return keywords.some(k => msg.includes(k));
}

// CHATBOT PAGE (optional, agar page use karte ho)
router.get("/chatbot", (req, res) => {
  res.render("chatbot");
});

// CHAT API (SAFE VERSION)
router.post("/chat", (req, res) => {
  try {
    const message = req.body && req.body.message
      ? req.body.message.toLowerCase()
      : "";

    let reply =
      "I’m here to help 😊 You can ask me about Nestara, bookings, locations, pricing, or listing a property.";

    // greetings
    if (match(message, ["hi", "hello", "hey"])) {
      reply = "Hello 👋 Welcome to Nestara! How can I help you today?";
    }

    // description / location
    else if (match(message, ["description", "describe", "location"])) {
      reply =
        "This location offers a comfortable and convenient stay with easy access to nearby attractions and essential amenities.";
    }

    // about website
    else if (match(message, ["about", "nestara", "website", "platform"])) {
      reply =
        "Nestara is a platform where users can explore, list, and book stays easily with a smooth user experience 🏡";
    }

    // booking
    else if (match(message, ["book", "booking", "stay"])) {
      reply =
        "You can book a stay by exploring listings, checking details, and completing the booking process 🏨";
    }

    // price
    else if (match(message, ["price", "cost", "rent"])) {
      reply =
        "Prices depend on the location, property type, and duration of stay 💰";
    }
     else if (match(msg, ["description", "summary"])) {
    reply = "This location offers a comfortable and convenient stay with easy access to nearby attractions and essential amenities.";
  }
   else if (match(msg, ["review", "comment"])) {
    reply = "The stay was pleasant and comfortable. The location was easy to reach, and all basic amenities were available. Overall, a good experience.";
  }

    // contact
    else if (match(message, ["contact", "support", "help"])) {
      reply =
        "You can contact our support team at support@nestara.com 📧";
    }

    // ALWAYS return JSON
    return res.json({ reply });

  } catch (err) {
    console.error("CHATBOT BACKEND ERROR:", err);
    return res.json({
      reply:
        "Sorry, I’m having a small issue right now. Please try again in a moment 🙂"
    });
  }
});

module.exports = router;
