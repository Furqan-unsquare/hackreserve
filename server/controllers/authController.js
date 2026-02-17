// server/controllers/authController.js

const login = (req, res) => {
    const { email, password } = req.body;
    if (email === 'ca@example.com' && password === 'password') {
        return res.json({
            message: 'Login successful',
            token: 'mock-jwt-token',
            user: { name: 'CA Akshat', email, role: 'CA' }
        });
    }
    res.status(401).json({ error: 'Invalid credentials' });
};

const register = (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    res.status(201).json({ message: 'User registered successfully', user: { name, email } });
};

module.exports = { login, register };
