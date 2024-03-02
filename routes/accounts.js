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

        const attributes = {
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            date_of_birth: req.body.date_of_birth,
            gender: req.body.gender,
            ssn: req.body.ssn,
            address: req.body.address,
            phone_number: req.body.phone_number,
            email: email
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            username: userName,
            password: hashedPassword,
            attributes: attributes,
        });

        await user.save();

        res.status(201).json({ msg: 'User registered successfully' });

    } catch (error) {
        res.status(400).json({msg: error})
    }
})

router.post('/login', async(req, res) => {
    
})

module.exports = router;