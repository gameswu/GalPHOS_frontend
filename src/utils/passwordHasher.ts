import CryptoJS from 'crypto-js';

// 密码哈希工具类
export class PasswordHasher {
  // 使用SHA-256进行密码哈希
  static hashPassword(password: string): string {
    return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
  }

  // 使用SHA-256 + 盐值进行密码哈希（更安全）
  static hashPasswordWithSalt(password: string, salt?: string): string {
    const defaultSalt = 'GalPHOS_2025_SALT'; // 默认盐值
    const actualSalt = salt || defaultSalt;
    return CryptoJS.SHA256(password + actualSalt).toString(CryptoJS.enc.Hex);
  }

  // 生成随机盐值
  static generateSalt(): string {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }
}

export default PasswordHasher;
