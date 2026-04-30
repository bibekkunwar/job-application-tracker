require('dotenv').config()

const supabase = require('./config/supabase');
const jobsRouter = require('./routes/jobs');
const express = require('express');

const app = express();

app.use(express.json());
app.use('/api/jobs',jobsRouter);

app.get('/', (req,res) => {
    res.json({message: 'Server is running'});
});

//test routes

// app.get('/test-db', async (req, res) => {
//   const { data, error } = await supabase
//     .from('JobApplication')
//     .select('*')

//   if (error) return res.status(500).json({ error: error.message })
//   res.json({ data })
// })

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});