const express = require('express');
const router = express.Router({ mergeParams: true });
const requireAuth = require('../middleware/auth');
const supabase = require('../config/supabase');

// GET all statuses for a job
router.get('/', requireAuth, async (req, res) => {
    try {
        const jobId = req.params.jobId;

        const { data, error } = await supabase
            .from('application_status')
            .select('*')
            .eq('job_id', jobId);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new status for a job
router.post('/', requireAuth, async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const { round, date, round_status, notes } = req.body;

        if (!round || !date) {
            return res.status(400).json({ error: 'round and date are required' });
        }

        const { data, error } = await supabase
            .from('application_status')
            .insert([{ job_id: jobId, round, date, round_status, notes }])
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Status added', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update a status
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const appId = req.params.id;
        const { round, date, round_status, notes } = req.body;

        const { data, error } = await supabase
            .from('application_status')
            .update({ round, date, round_status, notes })
            .eq('app_id', appId)
            .select();

        if (error) throw error;

        if (data.length === 0)
            return res.status(404).json({ error: 'Status not found' });

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a status
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const appId = req.params.id;

        const { data, error } = await supabase
            .from('application_status')
            .delete()
            .eq('app_id', appId)
            .select();

        if (error) throw error;

        if (data.length === 0)
            return res.status(404).json({ error: 'Status not found' });

        res.status(200).json({ message: 'Status deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;