const crypto = require("crypto");

const testCredentials = "um#hy@JK^s&5zM)6";
const encryptionKey = "7061997328817748";
const encryptionMethod = "AES";
const keySize = "128";
const cipherMode = "ECB";
const authorizationHeader = "Authorization";
const algorithm = "aes-128-ecb";

const findKey = (object, key) => {
    return Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase());
};

const validateAESEncrypt = (req) => {
    if (req.headers && findKey(req.headers, "app-type") && req.headers[findKey(req.headers, "app-type")].toLowerCase() == "wo" && findKey(req.headers, "auth-type") && req.headers[findKey(req.headers, "auth-type")].toLowerCase() == "basic" && findKey(req.headers, "INSTANCE-TYPE") && findKey(req.headers, "Authorization")) {
        return true;
    }
    return false;
};

const encrypt = (req) => {
    if (validateAESEncrypt(req)) {
        const headerValue = req.headers[findKey(req.headers, "Authorization")].replace("Basic ", "");
        console.log("Authorization Header: " + headerValue);
        const buffer = Buffer.from(headerValue, "base64");
        const message = buffer.toString("utf8").replace(":", "@");;
        console.log("Mesage: " + message);
        const initVector = Buffer.from("", "utf8");
        const cipher = crypto.createCipheriv(algorithm, encryptionKey, initVector);
        const encryptedData = Buffer.concat([cipher.update(message), cipher.final()]).toString("base64");
        console.log("AES Encrpted: " + encryptedData);
        const header = findKey(req.headers, "Authorization");
        if (header) {
            delete req.headers[header];
            req.headers["Authorization"] = encryptedData;
        }
    }
};

module.exports = {
    encrypt: encrypt,
    validateAESEncrypt: validateAESEncrypt
};