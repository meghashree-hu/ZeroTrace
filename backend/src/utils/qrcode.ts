import QRCode from "qrcode";

export const generateQRCode = async (token: string) => {

    const url = `http://localhost:5173/share/${token}`;

    const qr = await QRCode.toDataURL(url);

    return qr;

};