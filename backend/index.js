require('dotenv').config()

const supabase = require('./config/supabase');
const jobsRouter = require('./routes/jobs');
const statusRouter = require('./routes/status')
const auth = require('./routes/auth')
const express = require('express');
const cors = require('cors');
const app = express();

const allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

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