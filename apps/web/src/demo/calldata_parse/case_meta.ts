export type DemoCaseMeta = {
  label: string;
  description: string;
};

export const DEMO_CASE_META: Record<string, DemoCaseMeta> = {
  transfer: {
    label: "ERC-20 transfer",
    description: "Single-layer call with named ABI parameters (to, value).",
  },
  safeExec: {
    label: "Safe execTransaction",
    description: "Safe wrapper exposing one inner ERC-20 transfer.",
  },
  safeMultisend: {
    label: "Safe multiSend",
    description: "Two batched sub-calls via Safe MultiSend packed bytes.",
  },
  multicall3: {
    label: "Multicall3 aggregate3",
    description: "Batch of two calls through Multicall3 aggregate3.",
  },
  genericBytes: {
    label: "forward(bytes)",
    description: "Generic bytes unwrapper on a custom forward(bytes) call.",
  },
  resolveAbiInner: {
    label: "Async resolveAbi",
    description: "Inner transfer decoded via in-memory resolveAbi mock (abiByTarget).",
  },
  selectorOnly: {
    label: "Unknown selector",
    description: "No ABI available; selector and raw hex only.",
  },
};
