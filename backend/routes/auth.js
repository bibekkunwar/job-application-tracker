const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase')


router.post('/register', async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Enter credentials' });

        const { data, error } = await supabase.auth.signUp({ email, password })

        if (error)
            throw error

        res.status(201).json(
            {
                user: data.user,
                message: 'Account created successfully',
                session: data.session
            })

    }

    catch (error) {
        res.status(500).json({ error: error.message })
    }
})


router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body

        if (!email || !password)
            return res.status(400).json({ error: 'wrong credentials' });


        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error)
            throw error

        res.status(200).json({
            data: data.user,
            session: data.session,
            message: 'Logged in Successfully'
        });
    }

    catch (error) {
        res.status(500).json({ error: error.message })
    }


});

module.exports = router;