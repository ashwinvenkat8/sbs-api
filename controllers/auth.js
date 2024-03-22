const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const OTPAuth = require("otpauth");
const encode = require("hi-base32");

const Account = require('../mongo/model/Account');
const User = require('../mongo/model/User');

const register = async (req, res, next) => {
    const { username, email, password } = req.body;

    try {
        let usernameInDb = await User.findOne({ username: username });
        let emailInDb = await User.findOne({ email: email });

        if (emailInDb || usernameInDb) {
            res.status(400).json({ error: 'User already exists' });
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

        if (newUser.role === 'CUSTOMER' || newUser.role === 'MERCHANT') {
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
            res.status(401).json({ error: 'Incorrect password' });
            return;
        }

        if (userInDb.sessions.length >= 3) {
            res.status(401).json({ error: 'Only 3 active sessions are allowed at a time.' });
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

    } catch (err) {
        console.log(err.stack);
        next(err);
    }
};

const logout = async (req, res, next) => {
    const token = req.headers.authorization;
    const filter = { _id: req.userId };
    const update = { $pull: { sessions: { token: token } } };

    try {
        await User.updateOne(filter, update);
        res.status(200).json({ message: 'Logged out' });

    } catch (err) {
        console.error(err.stack);
        next(err);
    }
};


const __generateRandomBase32 = () => {
    const buffer = crypto.randomBytes(15);
    const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
    return base32;
};

const generateQR = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).send({ error: "Required parameters are missing" });
            return;
        }

        const user = await User.findOne({ _id: userId });
        
        if (!user) {
            res.status(404).send({ error: "User not found" });
            return;
        }

        const otpSecret = __generateRandomBase32();

        const totp = new OTPAuth.TOTP({
            issuer: 'EasyBank',
            label: 'EasyBank',
            algorithm: 'SHA256',
            digits: 8,
            secret: otpSecret,
        });
        
        await User.updateOne(
            { _id: userId },
            { $set: { 'otp.secret': otpSecret }}
        );
        
        res.status(200).send({ url: totp.toString() });

    } catch (err) {
        console.log(err.stack);
        next(err);
    }
};

// Verify OTP for the first time while onboarding a user
const verifyOTP = async (req, res, next) => {
    try {
        const userId = req.userId;
        const token = req.body.token;
        
        if (!userId || !token) {
            res.status(400).send({ error: 'Required parameters are missing' });
            return;
        }
        
        const user = await User.findOne({ _id: userId });
        if (!user) {
            res.status(404).send({ error: 'User not found' });
            return;
        }

        const totp = new OTPAuth.TOTP({
            issuer: 'EasyBank',
            label: 'EasyBank',
            algorithm: 'SHA256',
            digits: 8,
            secret: user.otp.secret,
        });

        const verified = totp.validate({ token });

        if (verified == null) {
            res.status(401).send(false);
            return;
        } else {
            await User.updateOne(
                { _id: userId },
                { $set: { 'otp.isVerified': true }}
            );

            res.status(200).send(true);
            return;
        }
    } catch (err) {
        console.log(err.stack);
        next(err);
    }
};

// Validate subsequent OTPs while performing sensitive operations
const validateOTP = async (req, res) => {
    try {
        const userId = req.userId;
        const token = req.body.token;
        
        if (!userId || !token) {
            res.status(400).send({ error: 'Required parameters are missing' });
            return;
        }
        
        const user = await User.findOne({ _id: userId });
        if (!user) {
            res.status(404).send({ error: 'User not found' });
            return;
        }

        if(!user.otp.isVerified) {
            res.status(401).send({ error: 'Incomplete 2FA enrollment' });
            return;
        }

        const totp = new OTPAuth.TOTP({
            issuer: 'EasyBank',
            label: 'EasyBank',
            algorithm: 'SHA256',
            digits: 8,
            secret: user.otp.secret,
        });

        const verified = totp.validate({ token });

        if (verified == null) {
            res.status(401).send(false);
            return;
        } else {
            res.status(200).send(true);
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

module.exports = { register, login, logout, generateQR, verifyOTP, validateOTP };
