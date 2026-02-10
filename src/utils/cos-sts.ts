/**
 * 腾讯云 COS STS 临时密钥管理工具
 */

interface STSCredentials {
  SecretId: string;
  SecretKey: string;
  SecurityToken: string;
  ExpiredTime: number;
}

interface STSResponse {
  credentials: {
    TmpSecretId: string;
    TmpSecretKey: string;
    Token: string;
  };
  expiredTime: number;
  requestId: string;
}

class COSSTSManager {
  private credentials: STSCredentials | null = null;
  private stsUrl: string = '';
  private isGettingCredentials = false;

  constructor(stsUrl?: string) {
    this.stsUrl = stsUrl || import.meta.env.VITE_COS_STS_URL || '';
  }

  /**
   * 检查临时密钥是否过期
   */
  private isCredentialsExpired(): boolean {
    if (!this.credentials) {
      return true;
    }
    // 提前5分钟刷新密钥
    return Date.now() >= this.credentials.ExpiredTime - 5 * 60 * 1000;
  }

  /**
   * 获取临时密钥
   */
  async getCredentials(): Promise<STSCredentials | null> {
    // 如果密钥未过期，直接返回
    if (this.credentials && !this.isCredentialsExpired()) {
      return this.credentials;
    }

    // 防止并发请求
    if (this.isGettingCredentials) {
      // 等待当前请求完成
      while (this.isGettingCredentials) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.credentials;
    }

    return this.fetchNewCredentials();
  }

  /**
   * 从STS服务获取新的临时密钥
   */
  private async fetchNewCredentials(): Promise<STSCredentials | null> {
    if (!this.stsUrl) {
      console.warn('STS URL 未配置，使用永久密钥模式');
      return null;
    }

    this.isGettingCredentials = true;

    try {
      console.log('正在获取 STS 临时密钥...');
      
      const response = await fetch(this.stsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'cos-upload-session',
          durationSeconds: 3600, // 1小时
        }),
      });

      if (!response.ok) {
        throw new Error(`STS 请求失败: ${response.status} ${response.statusText}`);
      }

      const data: STSResponse = await response.json();

      this.credentials = {
        SecretId: data.credentials.TmpSecretId,
        SecretKey: data.credentials.TmpSecretKey,
        SecurityToken: data.credentials.Token,
        ExpiredTime: data.expiredTime,
      };

      console.log('STS 临时密钥获取成功，有效期至:', new Date(data.expiredTime));
      return this.credentials;

    } catch (error) {
      console.error('获取 STS 临时密钥失败:', error);
      return null;
    } finally {
      this.isGettingCredentials = false;
    }
  }

  /**
   * 清除缓存的临时密钥
   */
  clearCredentials(): void {
    this.credentials = null;
  }

  /**
   * 检查是否启用了STS模式
   */
  isSTSEnabled(): boolean {
    return Boolean(this.stsUrl);
  }
}

// 全局实例
export const cosSTSManager = new COSSTSManager();

export type { STSCredentials }; 