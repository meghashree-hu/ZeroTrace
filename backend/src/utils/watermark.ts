import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import sharp from "sharp";

export interface WatermarkOptions {
  owner: string;
  shareId: string;
  sessionId: string;
  ip: string;
  timestamp: string;
}

function buildWatermarkText(data: WatermarkOptions) {
  return [
    "ZERO TRACE SECURE PRINT",
    `Owner : ${data.owner}`,
    `Share : ${data.shareId}`,
    `Session : ${data.sessionId}`,
    `IP : ${data.ip}`,
    `${data.timestamp}`,
  ].join("\n");
}

export async function watermarkPdf(
  pdfBuffer: Buffer,
  data: WatermarkOptions
): Promise<Buffer> {
 const pdf = await PDFDocument.load(pdfBuffer, {
  ignoreEncryption: true,
  updateMetadata: false,
});
  console.log("Pages:", pdf.getPageCount());

  const font = await pdf.embedFont(StandardFonts.HelveticaBold);

  const watermark = buildWatermarkText(data);

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();

    page.drawText(watermark, {
      x: width * 0.18,
      y: height * 0.35,
      size: 28,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.22,
      rotate: degrees(45),
      lineHeight: 30,
    });
  }

  const bytes = await pdf.save({
  useObjectStreams: false,
});

return Buffer.from(bytes);
}

export async function watermarkImage(
  imageBuffer: Buffer,
  data: WatermarkOptions
): Promise<Buffer> {

  const metadata = await sharp(imageBuffer).metadata();

  const width = metadata.width || 1200;
  const height = metadata.height || 1200;

  const svg = `
  <svg width="${width}" height="${height}">
    <style>
      .wm {
        fill: rgba(255,0,0,0.12);
        font-size: ${Math.max(width, height) / 18}px;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
      }

      .sub {
        fill: rgba(255,255,255,0.22);
        font-size: ${Math.max(width, height) / 40}px;
        font-family: Arial;
      }
    </style>

    <g transform="rotate(-35 ${width / 2} ${height / 2})">

      <text
        x="${width / 8}"
        y="${height / 2}"
        class="wm">

        CONFIDENTIAL

      </text>

      <text
        x="${width / 8}"
        y="${height / 2 + 60}"
        class="sub">

        Shared with:
        ${data.owner}

      </text>

      <text
        x="${width / 8}"
        y="${height / 2 + 110}"
        class="sub">

        Printed:
        ${data.timestamp}

      </text>

      <text
        x="${width / 8}"
        y="${height / 2 + 160}"
        class="sub">

        Protected by ZeroTrace

      </text>

    </g>

  </svg>`;

  return await sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(svg),
        gravity: "center",
      },
    ])
    .png()
    .toBuffer();
}