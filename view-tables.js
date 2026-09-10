const mysql = require('mysql2/promise');

async function runFinalSetup() {
  try {
    // 1. Initial connection to the server root
    const connection = await mysql.createConnection({
      host: 'jbac-db-cluster.cluster-cdeeuw0s2trf.ap-southeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'biUt2TrZ9EZAqn6GXhiA'
    });

    console.log("\n================================================");
    console.log("📡 CONNECTED TO AWS SYDNEY DATA CENTER...");
    console.log("================================================\n");

    // 2. Create a clean, isolated database for your church website data
    await connection.query('CREATE DATABASE IF NOT EXISTS jbac_db');
    console.log("✔ Isolated database 'jbac_db' created or verified.");

    // 3. Switch to your new database
    await connection.query('USE jbac_db');

    // 4. Create your announcements table framework layout safely here
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ Created 'announcements' table framework inside jbac_db.");

    // 5. Insert your welcoming entry record row
    const [rows] = await connection.query('SELECT * FROM announcements');
    if (rows.length === 0) {
      await connection.query(`
        INSERT INTO announcements (title, content)
        VALUES ('Welcome to JBAC Portal!', 'Greetings in the name of our Lord. Our serverless database cluster is now fully active, secure, and operational on AWS!')
      `);
      console.log("✔ Inserted welcome announcement entry record successfully.");
    }

    // 6. Print out final status verification check
    const [tables] = await connection.query('SHOW TABLES');
    console.log("\n📋 Current Tables inside 'jbac_db':");
    console.log(tables);

    const [finalData] = await connection.query('SELECT * FROM announcements');
    console.log("\n📰 Live Rows inside your 'announcements' table:");
    console.log(finalData);
    console.log("\n================================================");

    await connection.end();
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
  }
}

runFinalSetup();
