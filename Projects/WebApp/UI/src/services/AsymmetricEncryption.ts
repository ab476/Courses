/**
 * Class representing an asymmetric encryption utility using the RSA-OAEP algorithm with SHA-256.
 * This class provides methods to:
 *  - Generate a new RSA key pair.
 *  - Export and import RSA key pairs as Base64 encoded strings.
 *  - Encrypt plain text strings using the public key.
 *  - Decrypt encrypted data using the private key.
 *
 * Example usage:
 * 
 * ```
 * // Create a new instance with a freshly generated key pair.
 * const asymmetricEnc = await AsymmetricEncryption.New();
 *
 * // Encrypt some data.
 * const encrypted = await asymmetricEnc.encrypt("Secret message");
 *
 * // Decrypt the data.
 * const decrypted = await asymmetricEnc.decrypt(encrypted);
 * console.log(decrypted); // "Secret message"
 * ```
 */
export class AsymmetricEncryption {
  /**
   * The public key used for encryption.
   */
  public publicKey: CryptoKey;

  /**
   * The private key used for decryption.
   */
  public privateKey: CryptoKey;

  /**
   * Constructs an instance of AsymmetricEncryption with the provided RSA keys.
   *
   * @param {CryptoKey} publicKey - The RSA public key used for encryption.
   * @param {CryptoKey} privateKey - The RSA private key used for decryption.
   */
  constructor(publicKey: CryptoKey, privateKey: CryptoKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  /**
   * Creates a new instance of AsymmetricEncryption with a freshly generated RSA key pair.
   *
   * @returns {Promise<AsymmetricEncryption>} A promise that resolves to an instance of AsymmetricEncryption.
   */
  static async New(): Promise<AsymmetricEncryption> {
    const keyPair = await AsymmetricEncryption.generateKeyPair();
    return new AsymmetricEncryption(keyPair.publicKey, keyPair.privateKey);
  }

  /**
   * Generates an RSA-OAEP key pair using SHA-256.
   * The generated keys are extractable and can be used for encryption and decryption.
   *
   * @returns {Promise<CryptoKeyPair>} A promise that resolves to a CryptoKeyPair containing both the public and private keys.
   */
  static async generateKeyPair(): Promise<CryptoKeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, // Key size in bits.
        publicExponent: new Uint8Array([1, 0, 1]), // Common public exponent (65537).
        hash: "SHA-256",
      },
      true, // Keys are extractable.
      ["encrypt", "decrypt"]
    );
    return keyPair;
  }

  /**
   * Exports an RSA key pair to Base64 encoded strings.
   * The public key is exported in SPKI format and the private key in PKCS8 format.
   *
   * @param {CryptoKeyPair} keyPair - The RSA key pair to export.
   * @returns {Promise<{ publicKey: string, privateKey: string }>} 
   *          A promise that resolves to an object containing the Base64 encoded public and private keys.
   */
  static async exportRSAKeyPairToBase64(keyPair: CryptoKeyPair): Promise<{ publicKey: string; privateKey: string; }> {
    const exportedPublicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
    const exportedPrivateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    const base64PublicKey = btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
    const base64PrivateKey = btoa(String.fromCharCode(...new Uint8Array(exportedPrivateKey)));

    return { publicKey: base64PublicKey, privateKey: base64PrivateKey };
  }

  /**
   * Imports an RSA key pair from Base64 encoded strings.
   * The Base64 public key should be in SPKI format and the private key in PKCS8 format.
   *
   * @param {string} base64PublicKey - The Base64 encoded public key.
   * @param {string} base64PrivateKey - The Base64 encoded private key.
   * @returns {Promise<{ publicKey: CryptoKey, privateKey: CryptoKey }>}
   *          A promise that resolves to an object containing the imported public and private keys.
   */
  static async importRSAKeyPairFromBase64(base64PublicKey: string, base64PrivateKey: string): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey; }> {
    const publicKeyBuffer = Uint8Array.from(atob(base64PublicKey), c => c.charCodeAt(0));
    const privateKeyBuffer = Uint8Array.from(atob(base64PrivateKey), c => c.charCodeAt(0));

    const publicKey = await crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["encrypt"]
    );

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"]
    );

    return { publicKey, privateKey };
  }

  /**
   * Encrypts a plain text string using the public key.
   *
   * @param {string} data - The plain text data to encrypt.
   * @returns {Promise<string>} A promise that resolves to an string containing the encrypted data.
   */
  async encrypt(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      this.publicKey,
      encodedData
    );
    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
  }

  /**
   * Decrypts an string containing encrypted data using the private key.
   * @param {string} encryptedBase64Data - The encrypted data to decrypt.
   * @returns {Promise<string>} A promise that resolves to the decrypted plain text string.
   */
  async decrypt(encryptedBase64Data: string): Promise<string> {
    const encryptedData = Uint8Array.from(atob(encryptedBase64Data), c => c.charCodeAt(0))
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      this.privateKey,
      encryptedData
    );
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
}
