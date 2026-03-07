const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const SearchHistory = require('./models/SearchHistory');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

// Centralized CPCB Logic
const getCPCBDetails = (aqi) => {
    if (aqi <= 50) return { category: "Good", color: "#00B050" };
    if (aqi <= 100) return { category: "Satisfactory", color: "#92D050" };
    if (aqi <= 200) return { category: "Moderate", color: "#FFFF00" };
    if (aqi <= 300) return { category: "Poor", color: "#FFC000" };
    if (aqi <= 400) return { category: "Very Poor", color: "#FF0000" };
    return { category: "Severe", color: "#C00000" };
};

app.post('/api/forecast', async (req, res) => {
    try {
        // Forward to Flask AI Service
        const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, req.body);
        const aqi = aiResponse.data.prediction;
        const { category, color } = getCPCBDetails(aqi);

        // Upsert logic: Update if city exists, else create
        const update = {
            $set: { last_prediction: aqi, last_category: category, last_color: color, last_updated: new Date() },
            $push: { history: { $each: [{ val: aqi, category, date: new Date() }], $slice: -10 } }
        };

        const result = await SearchHistory.findOneAndUpdate(
            { city: req.body.city_name }, 
            update, 
            { upsert: true, new: true }
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/history', async (req, res) => {
    const history = await SearchHistory.find().sort({ last_updated: -1 });
    res.json(history);
});

app.listen(process.env.PORT || 5001, () => console.log('Backend ready.'));