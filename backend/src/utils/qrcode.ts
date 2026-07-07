import QRCode from "qrcode";

export const generateQRCode = async (url: string) => {

    const qr = await QRCode.toDataURL(url);

    return qr;

};
