const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
require('dotenv').config(); // Load environment variables

const app = express();

// ✅ Ensure MONGO_URI is defined before connecting
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  console.error("❌ Error: MONGO_URI is not defined! Check your .env file or environment variables.");
  process.exit(1);
}

// ✅ Connect to MongoDB with recommended settings
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true, // Optional in Mongoose v6+
    useUnifiedTopology: true, // Optional in Mongoose v6+
  })
  .then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if connection fails
  });

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Home Route - Display All Shortened URLs
app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls });
  } catch (err) {
    console.error("❌ Error fetching short URLs:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Create a New Short URL
app.post('/shortUrls', async (req, res) => {
  try {
    if (!req.body.fullUrl) return res.status(400).send("❌ Error: Full URL is required.");
    
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
  } catch (err) {
    console.error("❌ Error creating short URL:", err);
    res.status(400).send("Invalid URL");
  }
});

// ✅ Redirect to Full URL
app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });

    if (!shortUrl) {
      console.warn(`⚠️ Warning: Short URL "${req.params.shortUrl}" not found.`);
      return res.sendStatus(404);
    }

    shortUrl.clicks++;
    await shortUrl.save();
    
    res.redirect(shortUrl.full);
  } catch (err) {
    console.error("❌ Error handling short URL:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ✅ Start the server only after MongoDB is connected
const PORT = process.env.PORT || 5000;
mongoose.connection.once('open', () => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
