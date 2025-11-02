// 首页获取schemas和attestations数量
export const GET_HOME_SCHEMA_AND_ATTESTATIONS_COUNT = `
  query HomeTotals {
    aggregateAttestation {
      _count {
        _all
      }
    }
    aggregateSchema {
      _count {
        _all
      }
    }
  }
`;

// 首页获取最近的8条attestation数据
export const GET_HOME_ATTESTATIONS = `
  query HomeAttestations {
    attestations(take: 8, orderBy: { time: desc }) {
      id
      attester
      recipient
      time
      timeCreated
      txid
      schemaId
      isOffchain
      schema {
        id
        index
        time
      }
    }
  }
`;

// 首页获取最新的8条schema数据
export const GET_HOME_SCHEMAS = `
  query HomeSchemas {
    schemata(take: 8, orderBy: { time: desc }) {
      id
      schema
      creator
      resolver
      revocable
      index
      time
      txid
      attestations {
        id
      }
    }
  }
`;

// 分页获取attestation列表
export const GET_PAGE_ATTESTATIONS = `
  query GetAttestations($skip: Int, $take: Int) {
    attestations(skip: $skip, take: $take, orderBy: { time: desc }) {
      id
      attester
      recipient
      refUID
      revocable
      revocationTime
      time
      timeCreated
      txid
      data
      schemaId
      ipfsHash
      isOffchain
      schema {
        id
        index
        schema
        time
      }
    }
    aggregateAttestation {
      _count {
        _all
      }
    }
  }
`;

// 分页获取schema列表
export const GET_PAGE_SCHEMAS = `
  query GetSchemas($skip: Int, $take: Int) {
    schemata(skip: $skip, take: $take, orderBy: { time: desc }) {
      id
      schema
      creator
      resolver
      revocable
      index
      time
      txid
      attestations {
        id
      }
    }
    aggregateSchema {
      _count {
        _all
      }
    }
  }
`;

// 根据index获取schema详情
export const GET_SCHEMA_DETAIL = `
  query GetSchemaDetail($index: String!, $schemaId: String!) {
    schemata(where: { index: { equals: $index } }) {
      id
      schema
      creator
      resolver
      revocable
      index
      time
      txid
      attestations(take: 10, orderBy: { time: desc }) {
        id
        attester
        recipient
        revoked
        time
        isOffchain
        revocationTime
      }
      _count {
        attestations
      }
    }
    totalAttestations: aggregateAttestation(where: { schemaId: { equals: $schemaId } }) {
      _count {
        _all
      }
    }
    revokedAttestations: aggregateAttestation(where: { schemaId: { equals: $schemaId }, revocationTime: { gt: 0 } }) {
      _count {
        _all
      }
    }
  }
`;

// 根据schemaId获取schema index 和 id 以及 分页attestation列表
export const GET_ATTESTATIONS_BY_SCHEMA_ID = `
  query GetAttestationsBySchemaId($schemaId: String!, $skip: Int, $take: Int) {
    schemata(where: { id: { equals: $schemaId } }) {
      id
      index
    }
    attestations(
      where: { schemaId: { equals: $schemaId } }
      skip: $skip
      take: $take
      orderBy: { time: desc }
    ) {
      id
      attester
      recipient
      time
      timeCreated
      schemaId
      schema {
        id
        index
        schema
        time
      }
    }
    totalCount: aggregateAttestation(where: { schemaId: { equals: $schemaId } }) {
      _count {
        _all
      }
    }
  }
`;

// 根据uid获取attestation详情
export const GET_ATTESTATION_DETAIL = `
  query GetAttestationDetail($uid: String!) {
    attestations(where: { id: { equals: $uid } }) {
      id
      attester
      recipient
      refUID
      revocable
      revocationTime
      time
      timeCreated
      txid
      data
      schemaId
      ipfsHash
      isOffchain
      decodedDataJson
      schema {
        id
        index
        schema
        creator
        resolver
        revocable
        time
        txid
      }
    }
  }
`;

// 获取最新的4个schema数据
export const GET_LATEST_4_SCHEMAS = `
  query GetLatest4Schemas {
    schemata(take: 4, orderBy: { time: desc }) {
      id
      index
      schema
    }
  }
`;

// 根据 # / UID 搜索schema
export const GET_SCHEMA_BY_INDEX_UID = `
  query GetSchemaByIndexUid($index: String!, $uid: String!) {
    schemata(where: { OR: [{ index: { equals: $index } }, { id: { equals: $uid } }] }) {
      id
      index
      schema
    }
  }
`;
