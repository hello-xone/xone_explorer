export type DeFiDropdownItem = {
  text: string;
  icon: string;
} & (
  { dappId: string; url?: never } |
  { url: string; dappId?: never }
);
