const { validate } = require('node-telegram-webapps');
const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.resolve(process.cwd(), 'api', 'db.json');

async function getDb() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // নতুন DB ফাইল তৈরির জন্য
        if (error.code === 'ENOENT') {
            const defaultDb = { users: [], withdrawals: [] };
            await saveDb(defaultDb);
            return defaultDb;
        }
        console.error("DB Load Error, using default:", error.message);
        return { users: [], withdrawals: [] };
    }
}

async function saveDb(db) {
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 4), 'utf-8');
}

function getUser(db, tgId) {
    let user = db.users.find(u => u.tgId == tgId);
    if (!user) {
        user = { tgId, balance: 0.00, username: 'User' + tgId };
        db.users.push(user);
    }
    return user;
}

function validateTelegram(initData) {
    const BOT_TOKEN = process.env.BOT_TOKEN; 
    if (!BOT_TOKEN) {
        throw new Error("BOT_TOKEN environment variable is not set.");
    }
    return validate(BOT_TOKEN, initData);
}

module.exports = {
    getDb,
    saveDb,
    getUser,
    validateTelegram
};
