interface KHQRStatus {
  code: number;
  errorCode: string | null;
  message: string | null;
}

interface KHQRData {
  qr: string;
  md5: string;
}

interface KHQRResult {
  status: KHQRStatus;
  data: KHQRData;
}

export interface IndividualInfoOptional {
  accountInformation?: string;
  acquiringBank?: string;
  currency?: number;
  amount?: number;
  billNumber?: string;
  storeLabel?: string;
  terminalLabel?: string;
  mobileNumber?: string;
  purposeOfTransaction?: string;
  languagePreference?: string;
  merchantNameAlternateLanguage?: string;
  merchantCityAlternateLanguage?: string;
  upiMerchantAccount?: string;
  expirationTimestamp?: string;
  merchantCategoryCode?: string;
}

export declare class IndividualInfo {
  constructor(
    bakongAccountID: string,
    merchantName: string,
    merchantCity: string,
    optional?: IndividualInfoOptional
  );
  bakongAccountID: string;
  merchantName: string;
  merchantCity: string;
  currency: number;
  amount?: number;
  billNumber?: string;
}

export declare class MerchantInfo extends IndividualInfo {
  constructor(
    bakongAccountID: string,
    merchantName: string,
    merchantCity: string,
    merchantID: string,
    acquiringBank: string,
    optional?: IndividualInfoOptional
  );
}

export declare class BakongKHQR {
  generateIndividual(info: IndividualInfo): KHQRResult;
  generateMerchant(info: MerchantInfo): KHQRResult;
  static decode(qr: string): KHQRResult;
  static verify(qr: string): KHQRResult;
}

export declare const khqrData: {
  currency: {
    usd: number;
    khr: number;
  };
};

export declare class SourceInfo {}
