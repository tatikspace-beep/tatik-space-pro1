import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const SIGNED_URL_TTL_SECONDS = 15 * 60;

type StorageConfig = {
  bucket: string;
  region: string;
};

let s3Client: S3Client | undefined;
let s3Region: string | undefined;

function getStorageConfig(): StorageConfig {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;

  if (!bucket || !region) {
    throw new Error(
      "S3 storage is not configured: set AWS_S3_BUCKET and AWS_REGION"
    );
  }

  return { bucket, region };
}

function getS3Client(region: string): S3Client {
  if (!s3Client || s3Region !== region) {
    s3Client?.destroy();
    s3Client = new S3Client({ region });
    s3Region = region;
  }

  return s3Client;
}

function normalizeKey(relKey: string): string {
  const key = relKey.replace(/^\/+/, "");
  const segments = key.split("/");
  if (
    !key ||
    key.includes("\\") ||
    key.includes("\0") ||
    segments.some(segment => !segment || segment === "." || segment === "..")
  ) {
    throw new Error("Invalid S3 object key");
  }
  return key;
}

async function createDownloadUrl(
  client: S3Client,
  bucket: string,
  key: string,
  disposition: "attachment" | "inline"
): Promise<string> {
  return getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: disposition,
    }),
    { expiresIn: SIGNED_URL_TTL_SECONDS }
  );
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const { bucket, region } = getStorageConfig();
  const key = normalizeKey(relKey);
  const client = getS3Client(region);

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: await createDownloadUrl(client, bucket, key, "inline"),
  };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const { bucket, region } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await createDownloadUrl(
      getS3Client(region),
      bucket,
      key,
      "attachment"
    ),
  };
}

export async function storageReadText(relKey: string): Promise<string> {
  const { bucket, region } = getStorageConfig();
  const key = normalizeKey(relKey);
  const response = await getS3Client(region).send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );

  if (!response.Body) {
    throw new Error(`S3 object has no response body: ${key}`);
  }

  return response.Body.transformToString("utf-8");
}
