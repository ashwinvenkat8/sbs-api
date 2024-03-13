const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');

const Account = require('../mongo/model/Account');
const User = require('../mongo/model/User');

const register = async (req, res, next) => {
    const { username, email, password } = req.body;
    
    try {
        let usernameInDb = await User.findOne({ username: username });
        let emailInDb = await User.findOne({ email: email });

        if (emailInDb || usernameInDb) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const attributes = {
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            date_of_birth: req.body.date_of_birth,
            gender: req.body.gender,
            ssn: req.body.ssn,
            address: req.body.address,
            phone_number: req.body.phone_number
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser = new User({
            email: email,
            username: username,
            password: hashedPassword,
            attributes: attributes,
            role: req.body.role
        });
        await newUser.save();
        
        if(newUser.role === 'CUSTOMER' || newUser.role === 'MERCHANT') {
            const newACNumber = crypto.randomInt(1, 2e+14);
            let newAccount = new Account({ user: newUser._id, accountNumber: newACNumber });
            await newAccount.save();
        }

        res.status(201).json({ message: 'User registered successfully' });

    } catch (err) {
        console.log(err.stack);
        next(err);
    }
};

const login = async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const userInDb = await User.findOne({ username });
        if (!userInDb) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const passwordMatch = await userInDb.comparePassword(password);
        if (!passwordMatch) {
            res.status(401).json({ message: 'Incorrect password' });
            return;
        }

        if(userInDb.sessions.length >= 3) {
            res.status(401).json({ message: 'Only 3 active sessions are allowed at a time.'});
            return;
        }

        const currentSession = {
            sessionId: crypto.randomUUID(),
            token: jwt.sign({
                userId: userInDb._id,
                role: userInDb.role
            }, process.env.SECRET_KEY, { expiresIn: '30m' })
        };
        
        const filter = { _id: userInDb._id };
        const update = {
            $push: { sessions: currentSession },
            $set: { last_login: new Date().toISOString() }
        };

        await User.updateOne(filter, update);

        res.json({ token: currentSession.token });

    } catch(err) {
        console.log(err.stack);
        next(err);
    }
};

const logout = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const filter = { _id: req.userId };
    const update = { $pull: { sessions: { token: token }}};
    
    try {
        await User.updateOne(filter, update);
        res.status(200).json({ message: 'Logged out' });

    } catch(err) {
        console.error(err.stack);
        next(err);
    }
};

// TODO: Implement OTP generation function
// const generateOtp = async (req, res, next) => {};

// TODO: Implement OTP verification function
// const verifyOtp = async (req, res, next) => {};

module.exports = { register, login, logout };
