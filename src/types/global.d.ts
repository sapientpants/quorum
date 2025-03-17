/**
 * Type declarations for global interfaces
 * Adding support for Microsoft-specific APIs
 */

interface Window {
  /**
   * Microsoft implementation of the Web Cryptography API for IE11 and older Edge versions
   */
  msCrypto?: Crypto;
}
