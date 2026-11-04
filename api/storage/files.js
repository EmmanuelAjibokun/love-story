import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
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

    return res.status(200).json({ bucket: bucketName, files });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
