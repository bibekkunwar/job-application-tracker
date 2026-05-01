require('dotenv').config()

const supabase = require('./config/supabase');
const jobsRouter = require('./routes/jobs');
const statusRouter = require('./routes/status')
const auth = require('./routes/auth')
const express = require('express');

const app = express();

app.use(express.json());

app.use('/api/jobs',jobsRouter);

app.use('/api/auth', auth );

app.use('/api/jobs/:jobId/status', statusRouter)

app.get('/', (req,res) => {
    res.json({message: 'Server is running'});
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});