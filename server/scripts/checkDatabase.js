const db = require("../db");

async function checkDatabase() {
    try {
        const [tables] = await db.query("SHOW TABLES");
        console.log("Tables:", tables.map((row) => Object.values(row)[0]).join(", "));

        const [columns] = await db.query("SHOW COLUMNS FROM users");
        console.log("users columns:", columns.map((column) => column.Field).join(", "));
        await db.end();
    } catch (error) {
        console.error("Database check failed:", error.code || error.message);
        await db.end();
        process.exitCode = 1;
    }
}

checkDatabase();
