const { getDb, saveDb, getUser, validateTelegram } = require('./utils');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { initData, amount, details } = req.body;

    if (!initData || !amount || !details) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    
    try {
        const userDetails = validateTelegram(initData);
        const tgId = userDetails.user.id;
        
        const db = await getDb();
        const user = getUser(db, tgId);
        const withdrawAmount = parseFloat(amount);
        
        if (withdrawAmount > user.balance || withdrawAmount <= 0) {
            return res.status(400).json({ message: 'ব্যালেন্সে পর্যাপ্ত টাকা নেই বা পরিমাণ ভুল।' });
        }
        
        user.balance -= withdrawAmount;

        const withdrawalRequest = {
            id: db.withdrawals.length + 1,
            tgId: tgId,
            username: userDetails.user.username || userDetails.user.first_name,
            amount: withdrawAmount,
            details: details,
            status: 'Pending',
            date: new Date().toISOString()
        };
        db.withdrawals.push(withdrawalRequest);

        await saveDb(db);

        res.status(200).json({ message: 'Withdrawal request submitted successfully.', newBalance: user.balance });

    } catch (e) {
        console.error('API Error:', e.message);
        res.status(401).json({ message: 'Authorization Failed or Server Error.' });
    }
};
