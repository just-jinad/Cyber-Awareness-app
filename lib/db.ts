import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.eqclrrlleomnbjywyreb:Chocolate12345%40@aws-0-us-east-2.pooler.supabase.com:5432/postgres"'
const sql = postgres(connectionString)

export default sql

// import { createPool, Pool } from 'mysql2/promise';

// const pool: Pool = createPool({
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306, // Default MySQL port
//   user: process.env.DB_USER || 'your_heliohost_username',
//   password: process.env.DB_PASSWORD || 'your_heliohost_password',
//   database: process.env.DB_NAME || 'cyber_project',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });


// export default pool;


// import { createPool, Pool } from 'mysql2/promise';

// const pool: Pool = createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || 'password',
//   database: process.env.DB_NAME || 'cybersecurity_platform',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// export default pool;
