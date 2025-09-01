const spiiCrypto = (() => {
const TEXT = new TextEncoder();
const UNT = new TextDecoder();


async function deriveKey(passphrase, salt) {
const keyMaterial = await crypto.subtle.importKey(
'raw', TEXT.encode(passphrase), 'PBKDF2', false, ['deriveKey']
);
return await crypto.subtle.deriveKey({
name: 'PBKDF2',
salt,
iterations: 200000,
hash: 'SHA-256'
}, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}


async function encryptJson(obj, passphrase) {
const iv = crypto.getRandomValues(new Uint8Array(12));
const salt = crypto.getRandomValues(new Uint8Array(16));
const key = await deriveKey(passphrase, salt);
const data = TEXT.encode(JSON.stringify(obj));
const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
return { ct: btoa(String.fromCharCode(...new Uint8Array(ct))), iv: Array.from(iv), salt: Array.from(salt) };
}


async function decryptJson(pack, passphrase) {
const iv = new Uint8Array(pack.iv);
const salt = new Uint8Array(pack.salt);
const key = await deriveKey(passphrase, salt);
const ctBytes = Uint8Array.from(atob(pack.ct), c => c.charCodeAt(0));
const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ctBytes);
return JSON.parse(UNT.decode(pt));
}


return { encryptJson, decryptJson };
})();


if (typeof self !== 'undefined') self.spiiCrypto = spiiCrypto;