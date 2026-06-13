import axios from 'axios';

interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

interface STKPushParams {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MpesaService {
  private config: MpesaConfig;
  private baseUrl: string;

  constructor() {
    const environment = process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production' || 'sandbox';

    // Single line switch: Just change MPESA_ENVIRONMENT in .env
    const isSandbox = environment === 'sandbox';

    this.config = {
      consumerKey: isSandbox
        ? process.env.MPESA_SANDBOX_CONSUMER_KEY!
        : process.env.MPESA_PRODUCTION_CONSUMER_KEY!,
      consumerSecret: isSandbox
        ? process.env.MPESA_SANDBOX_CONSUMER_SECRET!
        : process.env.MPESA_PRODUCTION_CONSUMER_SECRET!,
      shortcode: isSandbox
        ? process.env.MPESA_SANDBOX_SHORTCODE!
        : process.env.MPESA_PRODUCTION_SHORTCODE!,
      passkey: isSandbox
        ? process.env.MPESA_SANDBOX_PASSKEY!
        : process.env.MPESA_PRODUCTION_PASSKEY!,
      callbackUrl: process.env.MPESA_CALLBACK_URL!,
      environment
    };

    this.baseUrl = isSandbox
      ? 'https://sandbox.safaricom.co.ke'
      : 'https://api.safaricom.co.ke';

    console.log(`🚀 M-Pesa Service initialized in ${environment.toUpperCase()} mode`);
  }

  /**
   * Get OAuth access token from Daraja API
   */
  private async getAccessToken(): Promise<string> {
    try {
      const auth = Buffer.from(
        `${this.config.consumerKey}:${this.config.consumerSecret}`
      ).toString('base64');

      console.log('🔑 Requesting M-Pesa access token...');
      console.log('📍 URL:', `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`);
      console.log('🔐 Consumer Key (first 20 chars):', this.config.consumerKey.substring(0, 20) + '...');

      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      console.log('✅ Access token received');
      return response.data.access_token;
    } catch (error: any) {
      console.error('❌ Error getting M-Pesa access token:');
      console.error('Status:', error.response?.status);
      console.error('Response:', JSON.stringify(error.response?.data, null, 2));
      console.error('Headers:', error.response?.headers);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  /**
   * Format phone number to required format (254XXXXXXXXX)
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any spaces, dashes, or plus signs
    phone = phone.replace(/[\s\-+]/g, '');

    // If starts with 0, replace with 254
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    }

    // If starts with 254, keep as is
    if (phone.startsWith('254')) {
      return phone;
    }

    // If starts with +254, remove +
    if (phone.startsWith('+254')) {
      return phone.slice(1);
    }

    // Otherwise, assume it's missing country code
    return '254' + phone;
  }

  /**
   * Generate password for STK Push (Base64 encoded string)
   */
  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(
      `${this.config.shortcode}${this.config.passkey}${timestamp}`
    ).toString('base64');

    return { password, timestamp };
  }

  /**
   * Initiate STK Push (Lipa Na M-Pesa Online)
   */
  async initiateSTKPush(params: STKPushParams): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(params.phoneNumber);

      // Round amount to nearest integer (M-Pesa doesn't accept decimals in API)
      const amount = Math.ceil(params.amount);

      const requestBody = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: amount,
        PartyA: formattedPhone,
        PartyB: this.config.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.config.callbackUrl,
        AccountReference: params.accountReference,
        TransactionDesc: params.transactionDesc,
      };

      console.log('📤 Initiating STK Push:', {
        phone: formattedPhone,
        amount: amount,
        reference: params.accountReference,
        environment: this.config.environment
      });

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ STK Push initiated successfully:', response.data.CheckoutRequestID);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error initiating STK Push:', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessage || 'Failed to initiate payment');
    }
  }

  /**
   * Query STK Push transaction status
   */
  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.config.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ Error querying STK Push status:', error.response?.data || error.message);
      throw new Error('Failed to query payment status');
    }
  }

  /**
   * Get current configuration (useful for debugging)
   */
  getConfig() {
    return {
      environment: this.config.environment,
      shortcode: this.config.shortcode,
      callbackUrl: this.config.callbackUrl,
    };
  }
}

// Export singleton instance
export default new MpesaService();
