// KeyProcessor.tsx
import { useState } from 'react';

// Helper function: GCD
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// RSA Key Generation
// RSA Key Generation
export const generateRSAKeys = (): { publicKey: [number, number]; privateKey: [number, number] } => {
    const generatePrime = (bits: number): number => {
      const isPrime = (num: number) => {
        for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
        return num > 1;
      };
      let prime = Math.floor(Math.random() * Math.pow(2, bits));
      while (!isPrime(prime)) prime++;
      return prime;
    };
  
    const modInverse = (e: number, phi: number): number => {
      let m0 = phi, t, q;
      let x0 = 0, x1 = 1;
  
      while (e > 1) {
        q = Math.floor(e / phi);
        t = phi;
        phi = e % phi;
        e = t;
        t = x0;
        x0 = x1 - q * x0;
        x1 = t;
      }
      return x1 < 0 ? x1 + m0 : x1;
    };
  
    const p = generatePrime(16);
    const q = generatePrime(16);
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    let e = 3;
    while (gcd(e, phi) !== 1) e++;
    const d = modInverse(e, phi);
  
    return { publicKey: [e, n], privateKey: [d, n] };
  };

// RSA Encrypt
// RSA Encrypt
export const rsaEncrypt = (message: string, publicKey: [number, number]): number => {
    const [e, n] = publicKey;
    // Convert the message to an integer
    const msgInt = message.split('').reduce((acc, char) => acc * 256 + char.charCodeAt(0), 0);
    return Math.pow(msgInt, e) % n;
  };
  

// RSA Decrypt
// RSA Decrypt without BigInt
export const rsaDecrypt = (ciphertext: number, privateKey: [number, number]): string => {
  const [d, n] = privateKey;

  // Check if the private key is valid
  if (!d || !n) {
    throw new Error("Invalid private key");
  }

  let decrypted = Math.pow(ciphertext, d) % n;
  const result: string[] = [];

  // Convert the decrypted number back to characters
  while (decrypted > 0) {
    result.unshift(String.fromCharCode(decrypted % 256));
    decrypted = Math.floor(decrypted / 256);
  }

  return result.join('');
};

// AES Encryption and Decryption
export const aesEncrypt = (plaintext: string, key: Uint8Array): Uint8Array => {
  const plaintextBytes = new TextEncoder().encode(plaintext);
  return plaintextBytes.map((byte, idx) => byte ^ key[idx % key.length]);
};

export const aesDecrypt = (ciphertext: Uint8Array, key: Uint8Array): string => {
  const decryptedBytes = ciphertext.map((byte, idx) => byte ^ key[idx % key.length]);
  return new TextDecoder().decode(decryptedBytes);
};

export const generateAESKey = (length = 16): Uint8Array => crypto.getRandomValues(new Uint8Array(length));
