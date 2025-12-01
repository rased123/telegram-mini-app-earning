const { getDb, saveDb, getUser, validateTelegram } = require('./utils');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    
    const { initData, amount } = req.body;

    if (!initData || !amount) {
        return res.status(400).json({ message: 'Missing data.' });
    }

    try {
        const userDetails = validateTelegram(initData);
        const tgId = userDetails.user.id;
        
        const db = await getDb();
        const user = getUser(db, tgId);
        
        user.balance += parseFloat(amount);
        await saveDb(db);

        res.status(200).json({ message: 'Earning recorded successfully.', newBalance: user.balance });

    } catch (e) {
        console.error('API Error:', e.message);
        res.status(401).json({ message: 'Authorization Failed or Server Error.' });
    }
};
