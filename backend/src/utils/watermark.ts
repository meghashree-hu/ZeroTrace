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
  const pdf = await PDFDocument.load(pdfBuffer);

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

  return Buffer.from(await pdf.save());
}

export async function watermarkImage(
  imageBuffer: Buffer,
  data: WatermarkOptions
): Promise<Buffer> {
  const svg = `
  <svg width="1200" height="1200">
    <style>
      .title {
        fill: rgba(150,150,150,0.25);
        font-size:40px;
        font-family:Arial;
        font-weight:bold;
      }
    </style>

    <g transform="rotate(-35 600 600)">
      <text x="180" y="420" class="title">
ZERO TRACE SECURE PRINT
Owner: ${data.owner}
Share: ${data.shareId}
Session: ${data.sessionId}
IP: ${data.ip}
${data.timestamp}
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