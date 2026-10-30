import { neon } from '@neondatabase/serverless';
import { S3Client, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Load .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

console.log("=== Testing Neon Postgres Service ===");
const databaseUrl = envConfig.DATABASE_URL;
console.log("Database URL Host:", new URL(databaseUrl).host);

const sql = neon(databaseUrl);

// Test Postgres Connection and Table Creation
try {
  const [{ now, version }] = await sql`SELECT NOW() as now, VERSION() as version;`;
  console.log("Postgres connected successfully!");
  console.log("Postgres timestamp:", now);
  console.log("Postgres version:", version.split(' ')[0] + ' ' + version.split(' ')[1]);

  console.log("\nCreating 'wedding_wishes' table if not exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS wedding_wishes (
      id SERIAL PRIMARY KEY,
      guest_name VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log("Table 'wedding_wishes' verified.");

  // Test Insert
  const [testWish] = await sql`
    INSERT INTO wedding_wishes (guest_name, message)
    VALUES ('Neon Automated Test', 'May your marriage be blessed abundantly!')
    RETURNING *;
  `;
  console.log("Successfully inserted test wish:", testWish);

  // Test Select
  const wishes = await sql`SELECT * FROM wedding_wishes ORDER BY created_at DESC LIMIT 5;`;
  console.log(`Successfully fetched ${wishes.length} wishes from Neon Postgres.`);
} catch (err) {
  console.error("Postgres error:", err);
  process.exit(1);
}

console.log("\n=== Testing Neon Object Storage Service ===");
const s3 = new S3Client({
  region: envConfig.AWS_REGION || 'us-east-2',
  endpoint: envConfig.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: envConfig.AWS_ACCESS_KEY_ID,
    secretAccessKey: envConfig.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

try {
  const bucketName = 'assets';
  console.log(`Testing upload to Neon bucket: '${bucketName}'...`);
  
  const testFileName = `test-love-story-${Date.now()}.txt`;
  await s3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: testFileName,
    Body: Buffer.from("Titilayo & Oluwaseyi Wedding Website Test File"),
    ContentType: "text/plain",
  }));
  console.log(`Successfully uploaded test file '${testFileName}' to Neon Object Storage!`);

  console.log(`Listing objects in '${bucketName}'...`);
  const listResp = await s3.send(new ListObjectsV2Command({
    Bucket: bucketName,
    MaxKeys: 10,
  }));
  console.log(`Objects in bucket:`, listResp.Contents?.map(o => o.Key) || []);
  console.log("Object storage verified successfully!");
} catch (err) {
  console.error("Object Storage error:", err);
  process.exit(1);
}

console.log("\nALL NEON SERVICES TESTED AND OPERATIONAL!");
