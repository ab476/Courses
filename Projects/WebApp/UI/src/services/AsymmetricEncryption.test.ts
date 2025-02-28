// AsymmetricEncryption.test.ts

import { AsymmetricEncryption } from "./AsymmetricEncryption";

describe("AsymmetricEncryption", () => {
  test("should generate a new instance with valid public and private keys", async () => {
    const instance = await AsymmetricEncryption.New();
    expect(instance.publicKey).toBeDefined();
    expect(instance.privateKey).toBeDefined();
  });

  test("should correctly encrypt and decrypt a message", async () => {
    const message = "Hello, World!";
    const instance = await AsymmetricEncryption.New();

    // Encrypt the message 
    const encryptedData = await instance.encrypt(message);
    expect(typeof encryptedData).toBe("string");

    // Decrypt the encrypted data
    const decryptedMessage = await instance.decrypt(encryptedData);
    expect(decryptedMessage).toBe(message);
  });

  test("should export and import RSA key pair as Base64 and work with the imported keys", async () => {
    // Create a new instance and extract its key pair
    const instance = await AsymmetricEncryption.New();
    const originalKeyPair: CryptoKeyPair = {
      publicKey: instance.publicKey,
      privateKey: instance.privateKey,
    };

    // Export the key pair to Base64 strings
    const exported = await AsymmetricEncryption.exportRSAKeyPairToBase64(originalKeyPair);
    expect(typeof exported.publicKey).toBe("string");
    expect(typeof exported.privateKey).toBe("string");

    // Optionally, verify that the strings contain Base64 valid characters
    const base64Regex = /^[A-Za-z0-9+/=]+$/;
    expect(exported.publicKey).toMatch(base64Regex);
    expect(exported.privateKey).toMatch(base64Regex);

    // Import the keys back from the Base64 strings
    const importedKeys = await AsymmetricEncryption.importRSAKeyPairFromBase64(exported.publicKey, exported.privateKey);
    expect(importedKeys.publicKey).toBeDefined();
    expect(importedKeys.privateKey).toBeDefined();

    // Create a new instance with the imported keys and test encryption/decryption
    const newInstance = new AsymmetricEncryption(importedKeys.publicKey, importedKeys.privateKey);
    const testMessage = "Test message for key import/export";
    const encryptedData = await newInstance.encrypt(testMessage);
    const decryptedMessage = await newInstance.decrypt(encryptedData);
    expect(decryptedMessage).toBe(testMessage);
  });

  test("generateKeyPair should return a valid CryptoKeyPair", async () => {
    const keyPair = await AsymmetricEncryption.generateKeyPair();
    expect(keyPair.publicKey).toBeDefined();
    expect(keyPair.privateKey).toBeDefined();

    // Verify that the public key can be exported (i.e., it's extractable)
    const exportedPublicKey = await AsymmetricEncryption.exportRSAKeyPairToBase64(keyPair)
    expect(typeof exportedPublicKey.publicKey).toBe("string");
    expect(typeof exportedPublicKey.privateKey).toBe("string");

  });
});
