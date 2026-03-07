const mongoose = require('mongoose');

const SearchHistorySchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  last_prediction: Number,
  last_category: String,
  last_color: String, // Storing the CPCB color for quick UI rendering
  last_updated: { type: Date, default: Date.now },
  history: [{
    val: Number,
    category: String,
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('SearchHistory', SearchHistorySchema);