import fs from "fs";
import path from "path";
import { watermarkPdf, watermarkImage, WatermarkOptions } from "./watermark";

export const createSecurePrintCopy = async (
  filePath: string,
  mimeType: string,
  watermarkData: WatermarkOptions,
  sessionId: string
): Promise<string> => {

  console.log("Reading:", filePath);

const originalBuffer = fs.readFileSync(filePath);

console.log("Buffer Size:", originalBuffer.length);

  let protectedBuffer: Buffer;

  if (mimeType === "application/pdf") {
    protectedBuffer = await watermarkPdf(originalBuffer, watermarkData);
  } else if (mimeType.startsWith("image/")) {
    protectedBuffer = await watermarkImage(originalBuffer, watermarkData);
  } else {
    protectedBuffer = originalBuffer;
  }

  const extension = path.extname(filePath);

  const tempFile = path.join(
    path.dirname(filePath),
    `secure-${sessionId}${extension}`
  );

  fs.writeFileSync(tempFile, protectedBuffer);

  return tempFile;
};