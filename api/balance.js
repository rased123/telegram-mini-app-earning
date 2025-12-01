const { getDb, getUser, validateTelegram } = require('./utils');

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        return res.status(405).send('Method Not Allowed');
    }

    const { tgId, initData } = req.query;

    if (!initData || !tgId) {
        return res.status(400).json({ message: 'Missing InitData or tgId.' });
    }

    try {
        validateTelegram(initData);
        const db = await getDb();
        const user = getUser(db, parseInt(tgId));
        
        res.status(200).json({ balance: user.balance });

    } catch (e) {
        console.error('API Error:', e.message);
        res.status(401).json({ message: 'Authorization Failed or Server Error.' });
    }
};
