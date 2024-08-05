import { r2 } from "../lib/cloudflare";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalServerError } from "elysia";
const { CLOUDFLARE_BUCKET } = process.env;

export const uploadService = {
  uploadBucket: async (
    buffer: Buffer,
    filename: string,
    contentType: string
  ) => {
    try {
      const putObjectCommand = new PutObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: filename,
        ContentType: contentType,
        Body: buffer,
      });

      const res = await r2.send(putObjectCommand);
      return res;
    } catch (error) {
      console.log("error", error);

      throw new InternalServerError("upload-failed");
    }
  },
  getUrlBucket: async (filename: string) => {
    try {
      const signedUrl = await getSignedUrl(
        r2,
        new GetObjectCommand({
          Bucket: CLOUDFLARE_BUCKET,
          Key: filename,
        })
      );

      return signedUrl;
    } catch (error) {
      throw new InternalServerError("get-url-failed");
    }
  },
  deleteBucket: async (filename: string) => {
    try {
      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: filename,
      });

      const res = await r2.send(deleteObjectCommand);
      return res;
    } catch (error) {
      throw new InternalServerError("delete-failed");
    }
  },
};
