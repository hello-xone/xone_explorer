import { getEnvValue } from 'configs/app/utils';

// Solidity 数据类型定义
export interface SolidityType {
  name: string;
  description: string;
}

export const SOLIDITY_TYPES: Array<SolidityType> = [
  {
    name: 'address',
    description: 'An address can be any ethereum address or contract address',
  },
  {
    name: 'string',
    description: 'A string can be any text of arbitrary length.',
  },
  {
    name: 'bool',
    description: 'A bool can either be on or off.',
  },
  {
    name: 'bytes32',
    description: 'A bytes32 is a 32 byte value. Useful for unique identifiers or small data.',
  },
  {
    name: 'bytes',
    description: 'A bytes value is an arbitrary byte value.',
  },
  {
    name: 'uint8',
    description: 'A uint8 is a integer value between 0 and 256',
  },
  {
    name: 'uint16',
    description: 'A uint16 is a integer value between 0 and 65536',
  },
  {
    name: 'uint24',
    description: 'A uint24 is a integer value between 0 and 16777216',
  },
  {
    name: 'uint32',
    description: 'A uint32 is a integer value between 0 and 4294967296',
  },
  {
    name: 'uint40',
    description: 'A uint40 is a integer value between 0 and 1099511627776',
  },
  {
    name: 'uint48',
    description: 'A uint48 is a integer value between 0 and 281474976710656',
  },
  {
    name: 'uint56',
    description: 'A uint56 is a integer value between 0 and 72057594037927936',
  },
  {
    name: 'uint64',
    description: 'A uint64 is a integer value between 0 and 18446744073709551616',
  },
  {
    name: 'uint72',
    description: 'A uint72 is a integer value between 0 and 4722366482869645213696',
  },
  {
    name: 'uint80',
    description: 'A uint80 is a integer value between 0 and 1208925819614629174706176',
  },
  {
    name: 'uint88',
    description: 'A uint88 is a integer value between 0 and 309485009821345068724781056',
  },
  {
    name: 'uint96',
    description: 'A uint96 is a integer value between 0 and 79228162514264337593543950336',
  },
  {
    name: 'uint104',
    description: 'A uint104 is a integer value between 0 and 20282409603651670423947251286016',
  },
  {
    name: 'uint112',
    description: 'A uint112 is a integer value between 0 and 5192296858534827628530496329220096',
  },
  {
    name: 'uint120',
    description: 'A uint120 is a integer value between 0 and 1329227995784915872903807060280344576',
  },
  {
    name: 'uint128',
    description: 'A uint128 is a integer value between 0 and 340282366920938463463374607431768211456',
  },
  {
    name: 'uint136',
    description: 'A uint136 is a integer value between 0 and 87112285931760246646623899502532662132736',
  },
  {
    name: 'uint144',
    description: 'A uint144 is a integer value between 0 and 22300745198530623141535718272648361505980416',
  },
  {
    name: 'uint152',
    description: 'A uint152 is a integer value between 0 and 5708990770823839524233143877797980545530986496',
  },
  {
    name: 'uint160',
    description: 'A uint160 is a integer value between 0 and 1461501637330902918203684832716283019655932542976',
  },
  {
    name: 'uint168',
    description: 'A uint168 is a integer value between 0 and 374144419156711147060143317175368453031918731001856',
  },
  {
    name: 'uint176',
    description: 'A uint176 is a integer value between 0 and 95780971304118053647396689196894323976171195136475136',
  },
  {
    name: 'uint184',
    description: 'A uint184 is a integer value between 0 and 24519928653854221733733552434404946937899825954937634816',
  },
  {
    name: 'uint192',
    description: 'A uint192 is a integer value between 0 and 6277101735386680763835789423207666416102355444464034512896',
  },
  {
    name: 'uint200',
    description: 'A uint200 is a integer value between 0 and 1606938044258990275541962092341162602522202993782792835301376',
  },
  {
    name: 'uint208',
    description: 'A uint208 is a integer value between 0 and 411376139330301510538742295639337626245683966408394965837152256',
  },
  {
    name: 'uint216',
    description: 'A uint216 is a integer value between 0 and 105312291668557186697918027683670432318895095400549111254310977536',
  },
  {
    name: 'uint224',
    description: 'A uint224 is a integer value between 0 and 26959946667150639794667015087019630673637144422540572481103610249216',
  },
  {
    name: 'uint232',
    description: 'A uint232 is a integer value between 0 and 6901746346790563787434755862277025452451108972170386555162524223799296',
  },
  {
    name: 'uint240',
    description: 'A uint240 is a integer value between 0 and 1766847064778384329583297500742918515827483896875618958121606201292619776',
  },
  {
    name: 'uint248',
    description: 'A uint248 is a integer value between 0 and 452312848583266388373324160190187140051835877600158453279131187530910662656',
  },
  {
    name: 'uint256',
    description: 'A uint256 is a integer value between 0 and 115792089237316195423570985008687907853269984665640564039457584007913129639936',
  },
  {
    name: 'int8',
    description: 'A int8 is a integer value between -128 and 127',
  },
  {
    name: 'int16',
    description: 'A int16 is a integer value between -32768 and 32767',
  },
  {
    name: 'int24',
    description: 'A int24 is a integer value between -8388608 and 8388607',
  },
  {
    name: 'int32',
    description: 'A int32 is a integer value between -2147483648 and 2147483647',
  },
  {
    name: 'int40',
    description: 'A int40 is a integer value between -549755813888 and 549755813887',
  },
  {
    name: 'int48',
    description: 'A int48 is a integer value between -140737488355328 and 140737488355327',
  },
  {
    name: 'int56',
    description: 'A int56 is a integer value between -36028797018963968 and 36028797018963968',
  },
  {
    name: 'int64',
    description: 'A int64 is a integer value between -9223372036854775808 and 9223372036854775808',
  },
  {
    name: 'int72',
    description: 'A int72 is a integer value between -2361183241434822606848 and 2361183241434822606848',
  },
  {
    name: 'int80',
    description: 'A int80 is a integer value between -604462909807314587353088 and 604462909807314587353088',
  },
  {
    name: 'int88',
    description: 'A int88 is a integer value between -154742504910672534362390528 and 154742504910672534362390528',
  },
  {
    name: 'int96',
    description: 'A int96 is a integer value between -39614081257132168796771975168 and 39614081257132168796771975168',
  },
  {
    name: 'int104',
    description: 'A int104 is a integer value between -10141204801825835211973625643008 and 10141204801825835211973625643008',
  },
  {
    name: 'int112',
    description: 'A int112 is a integer value between -2596148429267413814265248164610048 and 2596148429267413814265248164610048',
  },
  {
    name: 'int120',
    description: 'A int120 is a integer value between -664613997892457936451903530140172288 and 664613997892457936451903530140172288',
  },
  {
    name: 'int128',
    description: 'A int128 is a integer value between -170141183460469231731687303715884105728 and 170141183460469231731687303715884105728',
  },
  {
    name: 'int136',
    description: 'A int136 is a integer value between -43556142965880123323311949751266331066368 and 43556142965880123323311949751266331066368',
  },
  {
    name: 'int144',
    description: 'A int144 is a integer value between -11150372599265311570767859136324180752990208 and 11150372599265311570767859136324180752990208',
  },
  {
    name: 'int152',
    description: 'A int152 is a integer value between -2854495385411919762116571938898990272765493248 and 2854495385411919762116571938898990272765493248',
  },
  {
    name: 'int160',
    description: 'A int160 is a integer value between -730750818665451459101842416358141509827966271488 and 730750818665451459101842416358141509827966271488',
  },
  {
    name: 'int168',
    description: 'A int168 is a integer value between -187072209578355573530071658587684226515959365500928 and 187072209578355573530071658587684226515959365500928',
  },
  {
    name: 'int176',
    description: 'A int176 is a integer value between -47890485652059026823698344598447161988085597568237568 and 47890485652059026823698344598447161988085597568237568',
  },
  {
    name: 'int184',
    description: 'A int184 is a integer value between -12259964326927110866866776217202473468949912977468817408 and 12259964326927110866866776217202473468949912977468817408',
  },
  {
    name: 'int192',
    description: 'A int192 is a integer value between -3138550867693340381917894711603833208051177722232017256448 and 3138550867693340381917894711603833208051177722232017256448',
  },
  {
    name: 'int200',
    description: 'A int200 is a integer value between -803469022129495137770981046170581301261101496891396417650688 and 803469022129495137770981046170581301261101496891396417650688',
  },
  {
    name: 'int208',
    description: 'A int208 is a integer value between -205688069665150755269371147819668813122841983204197482918576128 and 205688069665150755269371147819668813122841983204197482918576128',
  },
  {
    name: 'int216',
    description: 'A int216 is a integer value between -52656145834278593348959013841835216159447547700274555627155488768 and 52656145834278593348959013841835216159447547700274555627155488768',
  },
  {
    name: 'int224',
    description: 'A int224 is a integer value between -13479973333575319897333507543509815336818572211270286240551805124608 and 13479973333575319897333507543509815336818572211270286240551805124608',
  },
  {
    name: 'int232',
    description: 'A int232 is a integer value between -3450873173395281893717377931138512726225554486085193277581262111899648 and 3450873173395281893717377931138512726225554486085193277581262111899648',
  },
  {
    name: 'int240',
    description: 'A int240 is a integer value between -883423532389192164791648750371459257913741948437809479060803100646309888 and 883423532389192164791648750371459257913741948437809479060803100646309888',
  },
  {
    name: 'int248',
    description: 'A int248 is a integer value between -226156424291633194186662080095093570025917938800079226639565593765455331328 and 226156424291633194186662080095093570025917938800079226639565593765455331328',
  },
  {
    name: 'int256',
    description: 'A int256 is a integer value between -57896044618658097711785492504343953926634992332820282019728792003956564819968 and 57896044618658097711785492504343953926634992332820282019728792003956564819968',
  },
];

// Schema 字段解析正则表达式
// 匹配格式: "type name" 或 "type[] name"
// 字段名只能包含字母、数字和下划线（符合 Solidity/ABI 规范）
// 例如: "string fieldName", "uint256[] values", "address recipient"
export const SCHEMA_FIELD_REGEX = /^(\w+(?:\[\])?)\s+([\w-]+)$/;

// 字段名验证正则表达式（用于验证用户输入）
// 必须以字母或下划线开头，后面可跟字母、数字或下划线
export const FIELD_NAME_REGEX = /^[a-z_]\w*$/i;

const isTestnet = getEnvValue('NEXT_PUBLIC_IS_TESTNET') === 'true';

export const EAS_CONFIG = {
  chainId: getEnvValue('NEXT_PUBLIC_NETWORK_ID'),
  chainName: isTestnet ? 'testnet' : 'mainnet',
  contractAddress: isTestnet ? getEnvValue('NEXT_PUBLIC_EAS_TESTNET_EAS') : getEnvValue('NEXT_PUBLIC_EAS_MAINNET_EAS'),
  schemaRegistryAddress: isTestnet ? getEnvValue('NEXT_PUBLIC_EAS_TESTNET_SCHEMA_REGISTRY') : getEnvValue('NEXT_PUBLIC_EAS_MAINNET_SCHEMA_REGISTRY'),
  rpcProvider: getEnvValue('NEXT_PUBLIC_NETWORK_RPC_URL'),
  graphqlEndpoint: getEnvValue('NEXT_PUBLIC_EAS_API_HOST'),
  refreshTime: getEnvValue('NEXT_PUBLIC_EAS_REFRESH_TIME') || 0,
};
