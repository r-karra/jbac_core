const mysql = require('mysql2/promise');

async function migrateAllTables() {
  const connection = await mysql.createConnection({
    host: 'jbac-db-cluster.cluster-cdeeuw0s2trf.ap-southeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'biUt2TrZ9EZAqn6GXhiA',
    database: 'jbac_db'
  });

  console.log("Connected to RDS MySQL cluster: jbac_db");

  const tables = [
    // 1. Announcements (already exists)
    `CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      date_posted TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 2. Events (already exists, ensure columns)
    `CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      event_name VARCHAR(255),
      description TEXT,
      event_date DATE,
      event_time VARCHAR(50),
      location VARCHAR(255),
      image TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 3. Members (already exists)
    `CREATE TABLE IF NOT EXISTS members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      phone VARCHAR(30),
      membership_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 4. Registrations (polymorphic table, already exists)
    `CREATE TABLE IF NOT EXISTS registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      registration_type VARCHAR(50) NOT NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(150),
      phone VARCHAR(30),
      additional_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 5. Sermons (already exists)
    `CREATE TABLE IF NOT EXISTS sermons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      topic VARCHAR(255) NOT NULL,
      preacher VARCHAR(255) NOT NULL,
      delivery_date DATE,
      audio_url TEXT
    )`,

    // 6. Users (Website auth: login / signup)
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      mobile_number VARCHAR(20) NOT NULL,
      email VARCHAR(150),
      password VARCHAR(255) NOT NULL,
      category INT NOT NULL DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      otp VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_mobile (mobile_number)
    )`,

    // 7. Believers
    `CREATE TABLE IF NOT EXISTS believers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fname VARCHAR(100) NOT NULL,
      lname VARCHAR(100),
      mobile_number VARCHAR(20) NOT NULL,
      whatsapp VARCHAR(20),
      email VARCHAR(150),
      password VARCHAR(255),
      dob DATE,
      gender VARCHAR(20),
      status VARCHAR(50),
      income VARCHAR(50),
      caste VARCHAR(50),
      subcaste VARCHAR(50),
      nativeplace VARCHAR(150),
      talent VARCHAR(255),
      education VARCHAR(150),
      designation VARCHAR(150),
      department VARCHAR(150),
      districts VARCHAR(100),
      constituencyname VARCHAR(100),
      mandals VARCHAR(100),
      villagename VARCHAR(150),
      panchayati VARCHAR(100),
      wardnumber VARCHAR(50),
      ward VARCHAR(50),
      nri VARCHAR(20),
      leadership VARCHAR(20),
      leadertype VARCHAR(50),
      generaltype VARCHAR(50),
      subward VARCHAR(50),
      wingtype VARCHAR(50),
      wingtypes VARCHAR(50),
      denomination_id VARCHAR(50),
      hobbies TEXT,
      spirti VARCHAR(50),
      lifegoal TEXT,
      church VARCHAR(150),
      pastor VARCHAR(150),
      youtube VARCHAR(255),
      god VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 8. Pastors
    `CREATE TABLE IF NOT EXISTS pastors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      mobile_number VARCHAR(20) NOT NULL,
      email VARCHAR(150),
      password VARCHAR(255),
      dob DATE,
      gender VARCHAR(20),
      qualification VARCHAR(150),
      denomination VARCHAR(100),
      church_name VARCHAR(150),
      ministry_name VARCHAR(150),
      experience VARCHAR(50),
      district VARCHAR(100),
      constituency VARCHAR(100),
      mandal VARCHAR(100),
      village VARCHAR(100),
      panchayati VARCHAR(100),
      address TEXT,
      image TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 9. Churches
    `CREATE TABLE IF NOT EXISTS churches (
      id INT AUTO_INCREMENT PRIMARY KEY,
      church_name VARCHAR(150) NOT NULL,
      pastor_name VARCHAR(150),
      mobile_number VARCHAR(20),
      email VARCHAR(150),
      password VARCHAR(255),
      denomination VARCHAR(100),
      district VARCHAR(100),
      constituency VARCHAR(100),
      mandal VARCHAR(100),
      village VARCHAR(100),
      panchayati VARCHAR(100),
      address TEXT,
      registration_number VARCHAR(100),
      established_year VARCHAR(10),
      image TEXT,
      location VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 10. Organisations
    `CREATE TABLE IF NOT EXISTS organisations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      org_name VARCHAR(150) NOT NULL,
      leader_name VARCHAR(150),
      mobile_number VARCHAR(20),
      email VARCHAR(150),
      password VARCHAR(255),
      category VARCHAR(100),
      district VARCHAR(100),
      constituency VARCHAR(100),
      mandal VARCHAR(100),
      village VARCHAR(100),
      panchayati VARCHAR(100),
      address TEXT,
      registration_number VARCHAR(100),
      image TEXT,
      website VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 11. Ministries
    `CREATE TABLE IF NOT EXISTS ministries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ministry_name VARCHAR(150) NOT NULL,
      leader_name VARCHAR(150),
      mobile_number VARCHAR(20),
      email VARCHAR(150),
      password VARCHAR(255),
      denomination VARCHAR(100),
      district VARCHAR(100),
      constituency VARCHAR(100),
      mandal VARCHAR(100),
      village VARCHAR(100),
      panchayati VARCHAR(100),
      address TEXT,
      image TEXT,
      website VARCHAR(255),
      youtube VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 12. Students
    `CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_name VARCHAR(150) NOT NULL,
      mobile_number VARCHAR(20) NOT NULL,
      email VARCHAR(150),
      password VARCHAR(255),
      dob DATE,
      gender VARCHAR(20),
      course VARCHAR(100),
      college_name VARCHAR(150),
      district VARCHAR(100),
      constituency VARCHAR(100),
      mandal VARCHAR(100),
      village VARCHAR(100),
      panchayati VARCHAR(100),
      address TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 13. Pastor Associations
    `CREATE TABLE IF NOT EXISTS pastor_associations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      association_name VARCHAR(150) NOT NULL,
      leader_name VARCHAR(150),
      mobile_number VARCHAR(20),
      email VARCHAR(150),
      password VARCHAR(255),
      district VARCHAR(100),
      constituency VARCHAR(100),
      mandal VARCHAR(100),
      village VARCHAR(100),
      panchayati VARCHAR(100),
      address TEXT,
      member_count INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 14. Attacks
    `CREATE TABLE IF NOT EXISTS attacks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      victimname1 VARCHAR(150),
      victimname2 VARCHAR(150),
      victim1num VARCHAR(20),
      victim2num VARCHAR(20),
      attackername1 VARCHAR(150),
      attackername2 VARCHAR(150),
      attacker1num VARCHAR(20),
      attacker2num VARCHAR(20),
      address TEXT,
      noteondescription TEXT,
      district_id VARCHAR(50),
      constituency_id VARCHAR(50),
      mandal_id VARCHAR(50),
      village_id VARCHAR(50),
      image1 TEXT,
      image2 TEXT,
      image3 TEXT,
      video1 TEXT,
      video2 TEXT,
      youtubevidlink VARCHAR(255),
      audiorecordonincident TEXT,
      document1 TEXT,
      document2 TEXT,
      document3 TEXT,
      usr_id VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 15. Jobs
    `CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      jobname VARCHAR(200) NOT NULL,
      qualification VARCHAR(150),
      experience VARCHAR(100),
      salary VARCHAR(100),
      location VARCHAR(200),
      description TEXT,
      number1 VARCHAR(20),
      number2 VARCHAR(20),
      districtname VARCHAR(100),
      constituencyname VARCHAR(100),
      mandals VARCHAR(100),
      village_name VARCHAR(100),
      google_location VARCHAR(255),
      image TEXT,
      facebook VARCHAR(255),
      youtube VARCHAR(255),
      usr_id VARCHAR(50),
      name VARCHAR(150),
      mobile_number VARCHAR(20),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 16. Business
    `CREATE TABLE IF NOT EXISTS business (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      number VARCHAR(20),
      image TEXT,
      address TEXT,
      denomation VARCHAR(100),
      districtname VARCHAR(100),
      constituencyname VARCHAR(100),
      mandals VARCHAR(100),
      village_name VARCHAR(100),
      ministry_id VARCHAR(100),
      ward VARCHAR(50),
      usr_id VARCHAR(50),
      name VARCHAR(150),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 17. Marriages
    `CREATE TABLE IF NOT EXISTS marriages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gender VARCHAR(20) NOT NULL,
      status VARCHAR(50),
      name VARCHAR(150) NOT NULL,
      denomation_id VARCHAR(50),
      ministry_id VARCHAR(100),
      believer_id VARCHAR(50),
      pastor_id VARCHAR(50),
      image TEXT,
      dob DATE,
      work VARCHAR(150),
      location VARCHAR(255),
      address TEXT,
      description TEXT,
      phonenumber VARCHAR(20),
      districtname VARCHAR(100),
      constituencyname VARCHAR(100),
      mandals VARCHAR(100),
      village_name VARCHAR(100),
      height VARCHAR(50),
      color VARCHAR(50),
      whealth VARCHAR(50),
      types VARCHAR(50),
      self VARCHAR(50),
      caste VARCHAR(50),
      subcaste VARCHAR(50),
      spirti VARCHAR(50),
      usr_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 18. Church Timings
    `CREATE TABLE IF NOT EXISTS church_timings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      church VARCHAR(150) NOT NULL,
      service_name VARCHAR(150) NOT NULL,
      day VARCHAR(50) NOT NULL,
      time_start VARCHAR(50),
      time_end VARCHAR(50),
      typetime VARCHAR(50),
      description TEXT,
      district_id VARCHAR(50),
      constituency_id VARCHAR(50),
      mandal_id VARCHAR(50),
      village_id VARCHAR(50),
      denomationid VARCHAR(50),
      ministry_id VARCHAR(50),
      address TEXT,
      location VARCHAR(255),
      image TEXT,
      number VARCHAR(20),
      usr_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 19. Meetings
    `CREATE TABLE IF NOT EXISTS meetings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mettingtype VARCHAR(100) NOT NULL,
      speakerone VARCHAR(150),
      speakertwo VARCHAR(150),
      speakerthree VARCHAR(150),
      speakerfour VARCHAR(150),
      fromdate DATE,
      todate DATE,
      fromtime VARCHAR(50),
      totime VARCHAR(50),
      image TEXT,
      districtname VARCHAR(100),
      constituencyname VARCHAR(100),
      mandals VARCHAR(100),
      village_name VARCHAR(100),
      description TEXT,
      address TEXT,
      location VARCHAR(255),
      facebook VARCHAR(255),
      youtube VARCHAR(255),
      denomation VARCHAR(100),
      usr_id VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 20. Institutes
    `CREATE TABLE IF NOT EXISTS institutes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      institutename VARCHAR(200) NOT NULL,
      collegetype VARCHAR(100),
      courses TEXT,
      phonenumber VARCHAR(20),
      youtube VARCHAR(255),
      website VARCHAR(255),
      facebook VARCHAR(255),
      image TEXT,
      description TEXT,
      district_id VARCHAR(50),
      constituency_id VARCHAR(50),
      mandal_id VARCHAR(50),
      village_id VARCHAR(50),
      location VARCHAR(255),
      address TEXT,
      ministry_id VARCHAR(50),
      believer_id VARCHAR(50),
      pastor_id VARCHAR(50),
      usr_id VARCHAR(50),
      number VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 21. Colleges
    `CREATE TABLE IF NOT EXISTS colleges (
      id INT AUTO_INCREMENT PRIMARY KEY,
      collegename VARCHAR(200) NOT NULL,
      image TEXT,
      location VARCHAR(255),
      address TEXT,
      phonenumber VARCHAR(20),
      districtname VARCHAR(100),
      constituencyname VARCHAR(100),
      mandals VARCHAR(100),
      village_name VARCHAR(100),
      church VARCHAR(150),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 22. Ads
    `CREATE TABLE IF NOT EXISTS ads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      type VARCHAR(100),
      image TEXT,
      description TEXT,
      number VARCHAR(20),
      usr_id VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 23. News
    `CREATE TABLE IF NOT EXISTS news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      content TEXT,
      image TEXT,
      category VARCHAR(100),
      posted_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 24. Help Requests
    `CREATE TABLE IF NOT EXISTS help_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      email VARCHAR(150),
      help_type VARCHAR(100),
      description TEXT,
      address TEXT,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 25. Contacts
    `CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(150),
      phone VARCHAR(20),
      subject VARCHAR(255),
      message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 26. Gallery
    `CREATE TABLE IF NOT EXISTS gallery (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200),
      image_url TEXT,
      video_url TEXT,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 27. Downloads
    `CREATE TABLE IF NOT EXISTS downloads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      file_url TEXT,
      description TEXT,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 28. Leaders
    `CREATE TABLE IF NOT EXISTS leaders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      role VARCHAR(150),
      wing_id VARCHAR(50),
      wing_name VARCHAR(150),
      image TEXT,
      bio TEXT,
      phone VARCHAR(20),
      email VARCHAR(150),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    // 29. Wings
    `CREATE TABLE IF NOT EXISTS wings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    // 30. Districts
    `CREATE TABLE IF NOT EXISTS districts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      distrct_nm VARCHAR(100) NOT NULL,
      state_id INT DEFAULT 1
    )`,

    // 31. Constituencies
    `CREATE TABLE IF NOT EXISTS constituencies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      const_nm VARCHAR(100) NOT NULL,
      dstrct_id INT NOT NULL
    )`,

    // 32. Mandals
    `CREATE TABLE IF NOT EXISTS mandals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      mndl_nm VARCHAR(100) NOT NULL,
      const_id INT NOT NULL,
      dstrct_id INT
    )`,

    // 33. Panchayats
    `CREATE TABLE IF NOT EXISTS panchayats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pnchyt_nm VARCHAR(100) NOT NULL,
      mndl_id INT NOT NULL,
      const_id INT
    )`,

    // 34. Denominations
    `CREATE TABLE IF NOT EXISTS denominations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      denomation_name VARCHAR(150) NOT NULL,
      description TEXT
    )`,

    // 35. Leader levels
    `CREATE TABLE IF NOT EXISTS leader_levels (
      id INT AUTO_INCREMENT PRIMARY KEY,
      level_name VARCHAR(100) NOT NULL
    )`,

    // 36. Educational Qualifications
    `CREATE TABLE IF NOT EXISTS educational_qualifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      qualification_name VARCHAR(100) NOT NULL
    )`,

    // 37. Services List
    `CREATE TABLE IF NOT EXISTS services_list (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_name VARCHAR(150) NOT NULL
    )`
  ];

  console.log("Executing Table Migrations...");
  for (const sql of tables) {
    await connection.query(sql);
  }
  console.log("✔ All 37 Tables verified/created successfully!");

  // Ensure 'image' and 'event_name' columns exist in events table
  try {
    await connection.query("ALTER TABLE events ADD COLUMN event_name VARCHAR(255)");
  } catch (e) {}
  try {
    await connection.query("ALTER TABLE events ADD COLUMN image TEXT");
  } catch (e) {}

  // Seed essential master data if empty
  // 1. Districts of Andhra Pradesh
  const [distRows] = await connection.query("SELECT COUNT(*) as count FROM districts");
  if (distRows[0].count === 0) {
    const districts = [
      'Visakhapatnam', 'Kakinada', 'East Godavari', 'West Godavari', 'Konaseema',
      'Eluru', 'Krishna', 'NTR District', 'Guntur', 'Palnadu', 'Bapatla',
      'Prakasam', 'Nellore', 'Tirupati', 'Chittoor', 'Annamayya', 'YSR Kadapa',
      'Sri Sathya Sai', 'Anantapur', 'Kurnool', 'Nandyal', 'Srikakulam',
      'Parvathipuram Manyam', 'Vizianagaram', 'Alluri Sitharama Raju'
    ];
    for (const d of districts) {
      await connection.query("INSERT INTO districts (distrct_nm, state_id) VALUES (?, 1)", [d]);
    }
    console.log(`✔ Seeded ${districts.length} Andhra Pradesh districts.`);
  }

  // 2. Denominations
  const [denRows] = await connection.query("SELECT COUNT(*) as count FROM denominations");
  if (denRows[0].count === 0) {
    const denominations = [
      'Baptist', 'Lutheran (AELC)', 'Pentecostal', 'Church of South India (CSI)',
      'Methodist', 'Roman Catholic', 'Seventh-day Adventist', 'Salvation Army',
      'Assemblies of God', 'Independent Church'
    ];
    for (const d of denominations) {
      await connection.query("INSERT INTO denominations (denomation_name) VALUES (?)", [d]);
    }
    console.log(`✔ Seeded ${denominations.length} denominations.`);
  }

  // 3. Leader Levels
  const [llRows] = await connection.query("SELECT COUNT(*) as count FROM leader_levels");
  if (llRows[0].count === 0) {
    const levels = ['State Level', 'District Level', 'Constituency Level', 'Mandal Level', 'Village Level', 'Ward Level'];
    for (const l of levels) {
      await connection.query("INSERT INTO leader_levels (level_name) VALUES (?)", [l]);
    }
    console.log(`✔ Seeded ${levels.length} leader levels.`);
  }

  // 4. Educational Qualifications
  const [eqRows] = await connection.query("SELECT COUNT(*) as count FROM educational_qualifications");
  if (eqRows[0].count === 0) {
    const edus = ['Below 10th', 'SSC / 10th', 'Intermediate / +2', 'Graduation / Degree', 'Post Graduation', 'Theology / B.Th / M.Div', 'Doctorate / Ph.D'];
    for (const e of edus) {
      await connection.query("INSERT INTO educational_qualifications (qualification_name) VALUES (?)", [e]);
    }
    console.log(`✔ Seeded ${edus.length} educational qualifications.`);
  }

  // 5. Wings
  const [wingRows] = await connection.query("SELECT COUNT(*) as count FROM wings");
  if (wingRows[0].count === 0) {
    const wings = [
      { name: 'Pastors Wing', description: 'Coordinating fellowship and pastoral care' },
      { name: 'Youth Wing', description: 'Empowering young leaders across communities' },
      { name: 'Women Fellowship Wing', description: 'Supporting family and women ministries' },
      { name: 'Legal & Protection Wing', description: 'Advocating and protecting religious freedom' },
      { name: 'Social Service Wing', description: 'Medical camps, education aid, and relief works' }
    ];
    for (const w of wings) {
      await connection.query("INSERT INTO wings (name, description) VALUES (?, ?)", [w.name, w.description]);
    }
    console.log(`✔ Seeded ${wings.length} wings.`);
  }

  // 6. Sample Ads if empty
  const [adRows] = await connection.query("SELECT COUNT(*) as count FROM ads");
  if (adRows[0].count === 0) {
    await connection.query(`
      INSERT INTO ads (title, type, image, description, number)
      VALUES 
      ('JBAC State Leadership Summit', 'Event', 'https://jbac.in/baneers/Banner02.png', 'Grand Christian convention with national leaders.', '9876543210'),
      ('Career & Educational Guidance', 'Education', 'https://jbac.in/baneers/Banner05.png', 'Free career counseling and scholarship assistance.', '9876543211')
    `);
    console.log("✔ Seeded sample ads.");
  }

  // Verify all tables
  const [allTables] = await connection.query("SHOW TABLES");
  console.log("\n========================================================");
  console.log(`📋 Total Tables in jbac_db: ${allTables.length}`);
  console.log("========================================================");
  for (const t of allTables) {
    const tName = Object.values(t)[0];
    const [c] = await connection.query(`SELECT COUNT(*) as cnt FROM ${tName}`);
    console.log(` - ${tName.padEnd(28)} : ${c[0].cnt} rows`);
  }

  await connection.end();
}

migrateAllTables().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
