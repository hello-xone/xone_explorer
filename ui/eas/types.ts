export interface EASItem {
  uid: string;
  schema: string;
  schemaId: string; // Schema #255 格式
  schemaName?: string; // Schema 名称，如 "WITNESSED ATTESTATIONS"
  from: string; // attester
  to: string; // recipient
  type: 'ONCHAIN' | 'OFFCHAIN';
  time?: number;
  revocationTime?: number;
  refUID?: string;
  revocable?: boolean;
  data?: string;
}

export interface EASStats {
  totalAttestations: number;
  totalSchemas: number;
  uniqueAttestors: number;
}

export interface EASResponse {
  items: Array<EASItem>;
  stats: EASStats;
  next_page_params: {
    offset?: number;
  } | null;
}

export interface SchemaItem {
  number: number; // Schema编号 如 255
  uid: string; // Schema UID
  schema: string; // Schema定义
  resolver: string; // Resolver地址
  attestations: number; // 使用该schema的attestation数量
  title?: string; // Schema标题（用于特色展示）
}

export interface SchemaDetail extends SchemaItem {
  created: number; // 创建时间戳
  creator: string; // 创建者地址
  transactionId: string; // 交易ID
  revocable: boolean; // 是否可撤销
  onchainAttestations: number; // 链上attestation数量
  offchainAttestations: number; // 链下attestation数量
  decodedSchema: Array<{
    type: string;
    name: string;
  }>;
}
