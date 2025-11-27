const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

async function uploadFile(file, folder) {
  const fileName = folder + "/" + crypto.randomUUID() + "-" + file.originalname;

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(params));

  return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${fileName}`;
}

module.exports = { uploadFile };