require('dotenv').config();

// Fix DNS resolution for MongoDB Atlas SRV records
// Some networks/ISPs block or fail to resolve SRV records
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const express = require('express');
const cors = require('cors');
const remedyRoutes = require('./routes/remedyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require('mongoose');

// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ayursaathi';
console.log('Connecting to MongoDB...');

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
})
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('URI used (masked):', mongoURI.replace(/\/\/[^@]+@/, '//<credentials>@'));
    });

mongoose.connection.on('disconnected', () => console.log('⚠️ MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

// Health-check route
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'AyurSathi API is running 🌿' });
});

app.use('/api/remedies', remedyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
