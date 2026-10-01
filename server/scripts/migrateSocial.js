const db = require("../db");

const statements = [
    "ALTER TABLE users ADD COLUMN academic_year ENUM('1st', '2nd', '3rd', '4th') NULL AFTER semester_id",
    `CREATE TABLE IF NOT EXISTS user_badges (
        user_id INT UNSIGNED NOT NULL, badge VARCHAR(80) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, badge),
        CONSTRAINT fk_badge_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS friend_requests (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, sender_id INT UNSIGNED NOT NULL,
        receiver_id INT UNSIGNED NOT NULL,
        status ENUM('pending', 'accepted', 'declined', 'blocked') NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_request_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_request_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uq_friend_request (sender_id, receiver_id), KEY idx_friend_receiver (receiver_id, status)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS global_messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED NOT NULL,
        message TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_global_message_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        KEY idx_global_messages (created_at)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS direct_messages (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, sender_id INT UNSIGNED NOT NULL,
        receiver_id INT UNSIGNED NOT NULL, message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_direct_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_direct_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
        KEY idx_direct_conversation (sender_id, receiver_id, created_at)
    ) ENGINE=InnoDB`
];

(async () => {
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM users LIKE 'academic_year'");
        if (!columns.length) await db.query(statements[0]);
        for (const statement of statements.slice(1)) await db.query(statement);
        console.log("Social schema ready");
    } finally { await db.end(); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });