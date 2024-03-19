const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const OTPAuth = require("otpauth");
const { encode } = require("hi-base32");

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
            res.status(401).json({ message: 'Incorrect password' });
            return;
        }

        if (userInDb.sessions.length >= 3) {
            res.status(401).json({ message: 'Only 3 active sessions are allowed at a time.' });
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
    const token = req.headers.authorization?.split(' ')[1];
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


const generateRandomBase32 = () => {
    const buffer = crypto.randomBytes(15);
    const base32 = encode(buffer).replace(/=/g, "").substring(0, 24);
    return base32;
};

const generateQR = async (req, res, next) => {
    try {
        const { uid } = req.userId;
        if (!uid) {
            res.status(400).send({ error: "Required parameters are missing" });
            return;
        }

        const user = await User.findOne({ _id: uid });
        if (!user) {
            res.status(404).send({ error: "User not found!" });
            return;
        }

        const base32_secret = generateRandomBase32();

        let totp = new OTPAuth.TOTP({
            issuer: "EasyBank",
            label: "EasyBank",
            algorithm: "SHA256",
            digits: 8,
            secret: base32_secret,
        });

        let otpauth_url = totp.toString();
        
        // await Account.updateOne(
        //     { _id: uid },
        //     { otp_auth_url: otpauth_url, otp_base32: base32_secret }
        // );

        res.status(200).send({ url: otpauth_url });

    } catch (err) {
        console.log(err.stack);
        next(err);
    }
};

//To verify OTP for the first time from the profile page
const verifyOTP = async (req, res, next) => {
    try {
        const { uid } = req.userId;
        const { token } = req.body;
        if (!uid || !token) {
            res.status(400).send({ error: "Required parameters are missing" });
            return;
        }
        const user = await User.findOne({ _id: uid });
        if (!user) {
            res.status(404).send({ error: "User not found!" });
            return;
        }

        let totp = new OTPAuth.TOTP({
            issuer: "EasyBank",
            label: "EasyBank",
            algorithm: "SHA256",
            digits: 8,
            secret: user.otp_base32,
        });

        let verified = totp.validate({ token });

        if (verified == null) {
            res.status(401).send({ verified: false });
            return;
        } else {
            await User.updateOne(
                { _id: uid },
                { $set: { otp_enabled: true, otp_verified: true } }
            );
            res.status(200).send({ verified: true });
            return;
        }
    } catch (err) {
        console.log(err.stack);
        next(err);
    }
};

const validateOTP = async (req, res) => {
    try {
        const { uid } = req.userId;
        const { token } = req.body;
        if (!uid || !token) {
            res.status(400).send({ error: "Required parameters are missing" });
            return;
        }
        const user = await User.findOne({ _id: uid });
        if (!user) {
            res.status(404).send({ error: "User not found!" });
            return;
        }

        let totp = new OTPAuth.TOTP({
            issuer: "EasyBank",
            label: "EasyBank",
            algorithm: "SHA256",
            digits: 8,
            secret: user.otp_base32,
        });

        let verified = totp.validate({ token });

        if (verified == null) {
            res.status(401).send({ verified: false });
            return;
        } else {
            res.status(200).send({ verified: true });
            return;
        }

    } catch (err) {
        console.log(err);
        res.status(500).send({ err: "Internal Server Error" });
    }
};

module.exports = { register, login, logout, generateQR, validateOTP, verifyOTP };
