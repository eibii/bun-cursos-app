import { S3Client } from "@aws-sdk/client-s3";
const { CLOUDFLARE_ENDPOINT, CLOUDFLARE_ACCESS_KEY, CLOUDFLARE_SECRET } =
  process.env;

// Crie uma nova instância da Cloudflare
export const r2 = new S3Client({
  region: "auto",
  endpoint: CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY,
    secretAccessKey: CLOUDFLARE_SECRET,
  },
});
