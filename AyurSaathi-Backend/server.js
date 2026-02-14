require('dotenv').config();
const express = require('express');
const cors = require('cors');
const remedyRoutes = require('./routes/remedyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayursaathi')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.use('/api/remedies', remedyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
