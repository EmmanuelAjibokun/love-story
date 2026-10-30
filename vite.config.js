import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { neon } from '@neondatabase/serverless';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Vite Plugin for Neon Postgres and Neon Object Storage API endpoints
function neonApiPlugin(env) {
  const databaseUrl = env.DATABASE_URL || env.DATABASE_URL_UNPOOLED || env.VITE_NEON_DATABASE_URL;
  const sql = databaseUrl ? neon(databaseUrl) : null;

  const s3 = new S3Client({
    region: env.AWS_REGION || 'us-east-2',
    endpoint: env.AWS_ENDPOINT_URL_S3,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  });

  const bucketName = 'assets';

  return {
    name: 'neon-api-plugin',
    configureServer(server) {
      // 1. POST /api/storage/upload - Upload photos/videos to Neon Object Storage
      server.middlewares.use('/api/storage/upload', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString());
            const { fileName, fileType, dataBase64 } = body;

            if (!fileName || !dataBase64) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing fileName or dataBase64' }));
            }

            const buffer = Buffer.from(dataBase64.replace(/^data:.*?;base64,/, ''), 'base64');
            const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;

            await s3.send(new PutObjectCommand({
              Bucket: bucketName,
              Key: fileKey,
              Body: buffer,
              ContentType: fileType || 'image/jpeg',
            }));

            // Generate presigned URL for secure access
            const getCmd = new GetObjectCommand({
              Bucket: bucketName,
              Key: fileKey,
            });
            const accessUrl = await getSignedUrl(s3, getCmd, { expiresIn: 604800 }); // 7 days

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              key: fileKey,
              url: accessUrl,
              bucket: bucketName
            }));
          } catch (err) {
            console.error('Neon storage upload error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });

      // 2. GET /api/storage/files - List files in Neon Object Storage
      server.middlewares.use('/api/storage/files', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          return res.end('Method Not Allowed');
        }

        try {
          const data = await s3.send(new ListObjectsV2Command({
            Bucket: bucketName,
            MaxKeys: 30,
          }));

          const files = await Promise.all((data.Contents || []).map(async obj => {
            const getCmd = new GetObjectCommand({
              Bucket: bucketName,
              Key: obj.Key,
            });
            const url = await getSignedUrl(s3, getCmd, { expiresIn: 86400 });
            return {
              key: obj.Key,
              size: obj.Size,
              lastModified: obj.LastModified,
              url,
            };
          }));

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ bucket: bucketName, files }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });

      // 3. /api/wishes - Neon Postgres Wishes API
      server.middlewares.use('/api/wishes', (req, res) => {
        if (!sql) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Neon database not configured' }));
        }

        if (req.method === 'GET') {
          (async () => {
            try {
              const rows = await sql`
                SELECT id, guest_name AS name, message AS text, created_at
                FROM wedding_wishes
                ORDER BY created_at DESC
                LIMIT 100;
              `;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(rows));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          })();
        } else if (req.method === 'POST') {
          const chunks = [];
          req.on('data', chunk => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString());
              const { name, message } = body;
              if (!name || !message) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Name and message are required' }));
              }

              const result = await sql`
                INSERT INTO wedding_wishes (guest_name, message)
                VALUES (${name.trim()}, ${message.trim()})
                RETURNING id, guest_name AS name, message AS text, created_at;
              `;

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result[0]));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), neonApiPlugin(env)],
    define: {
      'import.meta.env.DATABASE_URL': JSON.stringify(env.DATABASE_URL || ''),
      'import.meta.env.DATABASE_URL_UNPOOLED': JSON.stringify(env.DATABASE_URL_UNPOOLED || ''),
      'import.meta.env.NEON_BRANCH': JSON.stringify(env.NEON_BRANCH || ''),
      'import.meta.env.AWS_ENDPOINT_URL_S3': JSON.stringify(env.AWS_ENDPOINT_URL_S3 || ''),
      'import.meta.env.AWS_REGION': JSON.stringify(env.AWS_REGION || 'us-east-2'),
    },
  };
});
