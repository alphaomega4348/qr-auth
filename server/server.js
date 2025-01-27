const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const qrcode = require('qrcode');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(express.json());


const allowedOrigins = [
  `${process.env.FRONTEND_BASE_URL}`,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, 
}));

// Handle preflight OPTIONS requests
app.options('*', cors());



// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit if connection fails
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  qrCode: String,
  scanCount: { type: Number, default: 0 },
  firstScanDate: Date,
  isWhitelisted: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

// Middleware for JWT authentication
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Register Endpoint
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login Endpoint (Generates QR Code)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' });

    // Generate a signed QR token
    const qrToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const qrCodeImage = await qrcode.toDataURL(qrToken);

    user.qrCode = qrToken; // Save the signed token
    await user.save();

    res.json({ qrCodeImage });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Scan Endpoint (Admin-Side)
app.post('/api/scan', async (req, res) => {
  const { qrCodeData } = req.body;
  try {
    const user = await User.findOne({ qrCode: qrCodeData });
    if (!user) return res.status(404).json({ status: 'user_not_found' });

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Reset counts if 30 days have passed
    if (user.firstScanDate && user.firstScanDate.getTime() < thirtyDaysAgo) {
      user.scanCount = 0;
      user.firstScanDate = new Date();
      await user.save();
    }

    if (user.scanCount >= 30) {
      return res.json({ status: 'limit_reached' });
    }

    // Update scan count
    if (user.scanCount === 0) user.firstScanDate = new Date();
    user.scanCount += 1;
    await user.save();

    res.json({ status: 'success', remainingScans: 30 - user.scanCount });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Whitelist Endpoint
app.put('/api/whitelist/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isWhitelisted = true;
    user.scanCount = 0; // Reset scan count
    user.firstScanDate = new Date(); // Reset first scan date
    await user.save();

    res.json({ status: 'whitelisted', message: 'User successfully whitelisted. Limits have been reset.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Protected Route Example (Requires Authentication)
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: `Hello, user ${req.user.userId}` });
});
// Get All Users Endpoint
app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find({}, 'username isWhitelisted scanCount firstScanDate'); // Fetch relevant fields
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
