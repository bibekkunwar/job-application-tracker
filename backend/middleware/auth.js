const supabase = require("../config/supabase");

const requireAuth = async (req, res, next) => {
    const authToken = req.headers.authorization;

    if (!authToken) {
        return res.status(401).json({ error: 'No token provided. Please login !' });
    }

    // strip "Bearer " prefix if present
    const token = authToken.startsWith('Bearer ')
        ? authToken.split(' ')[1]
        : authToken

    const { data, error } = await supabase.auth.getUser(token);

    if (error)
        return res.status(401).json({ error: 'Invalid Token' })

    req.user = data.user

    next();





};

module.exports = requireAuth