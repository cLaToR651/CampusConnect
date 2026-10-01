const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function applySchema() {
    const schema = fs.readFileSync(path.join(__dirname, "..", "database", "schema.sql"), "utf8");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        multipleStatements: true,
    });

    try {
        const databaseName = process.env.DB_NAME;
        if (!databaseName) throw new Error("DB_NAME is not configured");
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${mysql.escapeId(databaseName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        await connection.query(`USE ${mysql.escapeId(databaseName)}`);
        await connection.query(schema);
        console.log("CampusConnect schema applied successfully.");
    } finally {
        await connection.end();
    }
}

applySchema().catch((error) => {
    console.error("Schema setup failed:", error.code || error.message);
    process.exit(1);
});
