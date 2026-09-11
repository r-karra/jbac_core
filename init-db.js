import mysql from 'mysql2/promise';

async function setupDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'jbac-db-cluster.cluster-cdeeuw0s2trf.ap-southeast-2.rds.amazonaws.com',
      port: 3306,
      user: 'admin',
      password: 'biUt2TrZ9EZAqn6GXhiA',
      database: 'jbac_db'
    });

    console.log("🚀 Connected to AWS Aurora Serverless v2 inside the network!");

    // 1. Create your church announcements table structure
    await connection.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✔ Created 'announcements' table framework layout.");

    // 2. Insert welcome announcement entry if empty
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM announcements');
    if (existing[0].count === 0) {
      await connection.query(`
        INSERT INTO announcements (title, content)
        VALUES ('Welcome to JBAC Portal!', 'Greetings in the name of our Lord. Our serverless database cluster is now fully active, secure, and operational on AWS!')
      `);
      console.log("✔ Inserted welcome announcement entry record successfully.");
    }

    await connection.end();
    console.log("🎉 All database migrations finished cleanly!");
  } catch (error) {
    console.error("❌ Database script failed:", error);
  }
}

setupDatabase();
