const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const app = express();

// Connect to MongoDB with proper options
mongoose.connect('mongodb://localhost/urlShortener', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home Route - Display All Shortened URLs
app.get('/', async (req, res) => {
    try {
        const shortUrls = await ShortUrl.find();
        res.render('index', { shortUrls });
    } catch (err) {
        console.error("❌ Error fetching short URLs:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Create a New Short URL
app.post('/shortUrls', async (req, res) => {
    try {
        await ShortUrl.create({ full: req.body.fullUrl });
        res.redirect('/');
    } catch (err) {
        console.error("❌ Error creating short URL:", err);
        res.status(400).send("Invalid URL");
    }
});

// Redirect to Full URL
app.get('/:shortUrl', async (req, res) => {
    try {
        const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
        if (!shortUrl) return res.sendStatus(404);

        shortUrl.clicks++;
        await shortUrl.save();

        res.redirect(shortUrl.full);
    } catch (err) {
        console.error("❌ Error handling short URL:", err);
        res.status(500).send("Internal Server Error");
    }
});

// Start the server only after MongoDB is connected
const PORT = process.env.PORT || 5000;
mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
