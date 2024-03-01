const express = require('express');
const bcrypt = require('bcrypt');

router = express()

router.post('/register', async(req, res) => {
    try {
        const userName = req.body.userName;
        const email = req.body.email;
        const password = req.body.password;

        let email_ifexists = await User.findOne({ email });
        let username_ifexists = await User.findOne({userName});

        if (email_ifexists && username_ifexists) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        if (username_ifexists) {
            return res.status(400).json({ msg: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });
    } catch (error) {
        
    }
})


router.post()

module.exports = router;