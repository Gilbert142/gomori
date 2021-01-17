const crypto = require("crypto");

const ALGORITHM = "aes-256-ctr";
const KEY = String(window.nw.App.argv).replace("--", "");

function encryptBuffer (buf, iv) {
	const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
	const encryptedBuffer = Buffer.concat([iv, cipher.update(buf), cipher.final()]);
	return encryptedBuffer;
}

function encrypt(data, encryptedData) {
	const iv = encryptedData ? encryptedData.slice(0, 16) : Buffer.alloc(16);
	return encryptBuffer(data, iv);
}

function decryptBuffer(encryptedBuffer) {
	const iv = encryptedBuffer.slice(0,16);
	encryptedBuffer = encryptedBuffer.slice(16);
	const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
	const buffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
	return buffer;
}

module.exports = { encryptBuffer, encrypt, decryptBuffer};
