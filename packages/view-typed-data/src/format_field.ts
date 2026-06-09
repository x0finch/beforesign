import type { FieldKind } from "@beforesign/json-render-catalog";
import { getChainById } from "@beforesign/core";
import type { TokenHint } from "./token_hints.ts";
import type { ViewFieldDescriptor } from "./field_descriptor.ts";

export const MAX_UINT256 =
  "115792089237316195423570985008687907853269984665640564039457584007913129639935";

const DOMAIN_LABELS: Record<string, string> = {
  name: "Domain name",
  version: "Domain version",
  chainId: "Chain ID",
  verifyingContract: "Verifying contract",
  salt: "Domain salt",
};

const MESSAGE_LABELS: Record<string, string> = {
  owner: "Owner",
  spender: "Spender",
  value: "Value",
  allowed: "Allowance",
  amount: "Amount",
  nonce: "Nonce",
  deadline: "Deadline",
  sigDeadline: "Deadline",
  expiration: "Expiration",
  expirationTime: "Expiration",
  startTime: "Start time",
  endTime: "End time",
  delegatee: "Delegatee",
  delegator: "Delegator",
  statement: "Statement",
  uri: "URI",
  offer: "Offer",
  consideration: "Consideration",
};

export function shortenAddress(address: string): string {
  if (address.length < 13) return address;
  return `${address.slice(0, 6)}…${address.slice(-5)}`;
}

export function formatTokenAmount(raw: string, hint: TokenHint): string {
  const value = BigInt(raw);
  const divisor = 10n ** BigInt(hint.decimals);
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionStr = fraction.toString().padStart(hint.decimals, "0");
  const wholeStr = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${wholeStr}.${fractionStr} ${hint.symbol}`;
}

export function inferKind(fieldType: string, fieldName: string): FieldKind {
  const normalizedType = fieldType.replace(/\s/g, "");
  if (normalizedType === "address") return "address";
  if (fieldName === "chainId") return "chainId";
  if (
    (fieldName.toLowerCase().includes("deadline") ||
      fieldName.toLowerCase().includes("expiration")) &&
    normalizedType.startsWith("uint")
  ) {
    return "timestamp";
  }
  if (
    (fieldName === "value" || fieldName === "amount" || fieldName === "allowed") &&
    normalizedType.startsWith("uint")
  ) {
    return "amount";
  }
  if (normalizedType === "bool") return "bool";
  return "text";
}

function formatFieldValue(
  fieldName: string,
  fieldType: string,
  rawValue: string,
  tokenHint?: TokenHint,
): { displayValue?: string | null } {
  const kind = inferKind(fieldType, fieldName);

  if (kind === "chainId") {
    const chainId = Number(rawValue);
    const chain = getChainById(chainId);
    return { displayValue: chain ? `${chain.nameEn} (${chainId})` : String(chainId) };
  }

  if (kind === "timestamp") {
    const seconds = Number(rawValue);
    if (Number.isFinite(seconds) && seconds > 0) {
      return { displayValue: new Date(seconds * 1000).toISOString().replace(/\.\d{3}Z$/, "Z") };
    }
  }

  if (kind === "amount" && tokenHint && /^\d+$/.test(rawValue)) {
    return { displayValue: formatTokenAmount(rawValue, tokenHint) };
  }

  if (kind === "address" && fieldName === "verifyingContract" && tokenHint) {
    return { displayValue: `${tokenHint.symbol} (${shortenAddress(rawValue)})` };
  }

  return { displayValue: null };
}

function fieldLabel(group: string, fieldName: string, pathLabel?: string): string {
  if (pathLabel) return pathLabel;
  if (group === "domain") return DOMAIN_LABELS[fieldName] ?? capitalize(fieldName);
  if (group === "message") return MESSAGE_LABELS[fieldName] ?? capitalize(fieldName);
  return capitalize(fieldName);
}

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return String(value);
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

export function buildFieldDescriptor(opts: {
  id: string;
  group: string;
  fieldName: string;
  fieldType: string;
  rawValue: unknown;
  tokenHint?: TokenHint;
  pathLabel?: string;
  label?: string;
}): ViewFieldDescriptor {
  const value = stringifyValue(opts.rawValue);
  const kind = inferKind(opts.fieldType, opts.fieldName);
  const { displayValue } = formatFieldValue(opts.fieldName, opts.fieldType, value, opts.tokenHint);

  return {
    id: opts.id,
    group: opts.group,
    label: opts.label ?? fieldLabel(opts.group, opts.fieldName, opts.pathLabel),
    value,
    ...(displayValue ? { displayValue } : {}),
    kind,
  };
}
