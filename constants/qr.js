const QRCode = require("qrcode");

async function generateQRCode(payload) {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(payload);
    console.log({ qrCodeDataURL });
    return qrCodeDataURL;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
}

module.exports = {
  generateQRCode,
};
