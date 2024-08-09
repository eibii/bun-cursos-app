import { r2 } from "../lib/cloudflare";
import {
  HeadObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { InternalServerError } from "elysia";
const { CLOUDFLARE_BUCKET } = process.env;

export const uploadService = {
  upload: async (
    buffer: Buffer,
    filename: string,
    contentType: string,
    replace?: boolean
  ) => {
    try {
      if (uploadService.exists(filename) && replace) {
        await uploadService.delete(filename);
      }
      const putObjectCommand = new PutObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: filename,
        ContentType: contentType,
        Body: buffer,
      });

      const res = await r2.send(putObjectCommand);
      return res;
    } catch (error) {
      throw new InternalServerError("upload-failed");
    }
  },
  exists: async (filename: string) => {
    try {
      const headObjectCommand = new HeadObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: filename,
      });

      await r2.send(headObjectCommand);
      return true;
    } catch (error) {
      return false;
    }
  },
  getUrl: async (filename: string) => {
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
  delete: async (filename: string) => {
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
  rename: async (oldFilename: string, newFilename: string) => {
    try {
      const copyObjectCommand = new CopyObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        CopySource: `${CLOUDFLARE_BUCKET}/${oldFilename}`,
        Key: newFilename,
      });

      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: CLOUDFLARE_BUCKET,
        Key: oldFilename,
      });

      await r2.send(copyObjectCommand);
      await r2.send(deleteObjectCommand);

      return await uploadService.getUrl(newFilename);
    } catch (error) {
      throw new InternalServerError("rename-failed");
    }
  },
};
