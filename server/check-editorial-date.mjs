import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute(
  "SELECT dateLabel, title, createdAt FROM daily_editorial ORDER BY createdAt DESC LIMIT 3"
);
console.log(JSON.stringify(rows, null, 2));
await conn.end();
