import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { neon } from '@neondatabase/serverless';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const databaseUrl = 
  process.env.DATABASE_URL || 
  process.env.DATABASE_URL_UNPOOLED || 
  process.env.VITE_NEON_DATABASE_URL;

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: true,
});

const bucketName = 'assets';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (!body) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    } else if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const { fileName, fileType, dataBase64, slideId } = body || {};

    if (!fileName || !dataBase64) {
      return res.status(400).json({ error: 'Missing fileName or dataBase64' });
    }

    const buffer = Buffer.from(dataBase64.replace(/^data:.*?;base64,/, ''), 'base64');
    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `story-slides/slide-${slideId || 'custom'}-${Date.now()}-${cleanName}`;

    await s3.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: fileType || 'image/jpeg',
    }));

    // Generate presigned URL for long-term secure access (7 days)
    const getCmd = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });
    const accessUrl = await getSignedUrl(s3, getCmd, { expiresIn: 604800 });

    // Automatically update the story_slides table in Neon Postgres if slideId is provided
    if (slideId && databaseUrl) {
      const sql = neon(databaseUrl);
      const isVideo = (fileType || '').startsWith('video/');
      await sql`
        UPDATE story_slides
        SET 
          media_url = ${accessUrl},
          media_type = ${isVideo ? 'video' : 'image'},
          is_custom_media = TRUE,
          updated_at = CURRENT_TIMESTAMP
        WHERE slide_id = ${Number(slideId)};
      `;
    }

    return res.status(200).json({
      success: true,
      key: fileKey,
      url: accessUrl,
      bucket: bucketName,
      slideId
    });
  } catch (err) {
    console.error('Neon storage upload error on Vercel:', err);
    return res.status(500).json({ error: err.message });
  }
}
