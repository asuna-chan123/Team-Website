require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();
app.use(express.json());
app.use(cors());

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Missing MONGODB_URI in Backend/.env');
    process.exit(1);
}

mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    retryWrites: true,
})
    .then(() => console.log('🎉 Kết nối thành công tới MongoDB Atlas!'))
    .catch((error) => {
        console.error('❌ Lỗi kết nối MongoDB Atlas:', error.message);
        process.exit(1);
    });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    avatar: { type: String, default: '' },
    purchaseHistory: { type: Array, default: [] },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password, phone = '', address = '' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Full name, email and password are required.' });
        }

        if (!email.includes('@')) {
            return res.status(400).json({ error: 'Email must include @.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        if (phone && !/^\d{9,11}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone number must contain only digits and be 9 to 11 characters long.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'This email is already registered.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            phone,
            address,
            purchaseHistory: [],
        });

        res.status(201).json({
            message: 'Registration successful.',
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                avatar: newUser.avatar,
                purchaseHistory: newUser.purchaseHistory,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to register user right now.' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const identifier = String(email || '').trim();
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { phone: identifier },
            ],
        });

        if (!user) {
            return res.status(400).json({ error: 'Email or phone number does not exist.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Password is incorrect.' });
        }

        res.json({
            message: 'Signed in successfully.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                address: user.address,
                avatar: user.avatar,
                purchaseHistory: user.purchaseHistory || [],
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'System error while signing in.' });
    }
});

app.put('/api/profile/:id', async (req, res) => {
    try {
        const { username, phone, address, avatar } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { username, phone, address, avatar },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ message: 'Profile updated successfully.', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Unable to update profile.' });
    }
});

app.get('/api/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'System error.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server Backend đang chạy ở port ${PORT}`));