import type { AddressMetadataTagType } from 'types/api/addressMetadata';

export interface FormFields {
  name: string;
  website: string;
  description: string;
  whitepaper: string;
  explorer: string;
  type: string;
  symbol: string;
  decimals: number;
  status: string;
  email: string;
  id: string;
  twitter: string;
  telegram: string;
  reddit: string;
  discord: string;
  slack: string;
  instagram: string;
  wechat: string;
  facebook: string;
  medium: string;
  github: string;
  blog: string;
  bitcointalk: string;
  youtube: string;
  tiktok: string;
  forum: string;
  linkedin: string;
  opensea: string;
  coinMarketCap: string;
  coinGecko: string;
  ave: string;
}

export interface SubmitRequestBody {
  requesterName: string;
  requesterEmail: string;
  companyName?: string;
  companyWebsite?: string;
  address: string;
  name: string;
  tagType: AddressMetadataTagType;
  description?: string;
  meta: {
    bgColor?: string;
    textColor?: string;
    tagUrl?: string;
    tagIcon?: string;
    tooltipDescription?: string;
  };
}

export interface FormSubmitResultItem {
  error: string | null;
  payload: SubmitRequestBody;
}

export type FormSubmitResult = Array<FormSubmitResultItem>;

export interface FormSubmitResultGrouped {
  requesterName: string;
  requesterEmail: string;
  companyName?: string;
  companyWebsite?: string;
  items: Array<FormSubmitResultItemGrouped>;
}

export interface FormSubmitResultItemGrouped {
  error: string | null;
  addresses: Array<string>;
  tags: Array<Pick<SubmitRequestBody, 'name' | 'tagType' | 'meta'>>;
}
