const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth')

const supabase = require('../config/supabase.js');

// get all the jobs 

router.get('/', requireAuth, async (req, res) => {

    try {

        const { data, error } = await supabase
            .from('job_application')
            .select('*')
            .eq('user_id', req.user.id);

        if (error)
            throw error;

        res.status(200).json(data)
    }



    catch (error) {
        console.error('something went wrong', error.message);
        res.status(500).json({ error: error.message })
    }

});

// end of get all job


// start of post job application

router.post('/', requireAuth, async (req, res) => {



    try {

        const { user_id, company_name, role, status, platform, notes, job_url, date_applied } = req.body;

        if (!company_name || !role || !status || !date_applied) {
            return res.status(400).json({ error: 'Input the required field' })
        }

        const { data, error } = await supabase
            .from('job_application')
            .insert([{ user_id: req.user.id, company_name, role, status, platform, notes, job_url, date_applied }]).select();

        if (error)
            throw error;

        res.status(201).json({
            message: 'Data inserted successfully',
            data: data
        });
    }



    catch (error) {
        console.error('something went wrong', error.message);
        res.status(500).json({
            error: 'An internal server error occured',
            details: error.message
        })
    }

});

// end of post job application

// start of get job by id

router.get('/:id', requireAuth, async (req, res) => {

    try {

        const jobId = req.params.id

        const { data, error } = await supabase
            .from('job_application')
            .select('*').eq('job_id', jobId)
            .eq('user_id', req.user.id)

        if (error)
            throw error;

        if (data.length === 0)
            return res.status(404).json({ error: 'Incorrect job ID' })

        res.status(200).json(data)
    }



    catch (error) {
        console.error('something went wrong', error.message);
        res.status(500).json({ error: error.message })
    }

});

// enf of get job by ID

// start of put by id

router.put('/:id', requireAuth, async (req, res) => {

    try { 

        const jobId = req.params.id;
        const { status, notes, platform, role, company_name, job_url, date_applied } = req.body

        const { data, error } = await supabase
            .from('job_application')
            .update({ status, notes, platform, role, company_name, job_url, date_applied })
            .eq('job_id', jobId)
            .eq('user_id', req.user.id)
            .select();

        if (error)
            throw error;

        if (data.length === 0)
            return res.status(404).json({ error: 'job not found' })

        res.status(200).json(data)
    }

    catch (error) {
        res.status(500).json({ error: error.message })
    }
});

// end of put by id

// start of delete by id

router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const jobId = req.params.id;

        const { data, error } = await supabase
            .from('job_application')
            .delete().eq('job_id', jobId)
            .eq('user_id', req.user.id)

        if (error)
            throw error

        if (data.length === 0) {
            return res.status(404).json({ error: 'job not found' })
        }

        res.status(200).json('Job successfully deleted')

    }

    catch (error) {
        res.status(500).json({ error: error.message })
    }
});


module.exports = router;