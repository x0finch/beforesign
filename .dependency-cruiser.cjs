/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "web-only-orchestrator",
      comment: "apps/web must not import parse/detect/clients directly",
      severity: "error",
      from: { path: "^apps/web/src" },
      to: {
        path: "^packages/(parse|detect|clients)",
      },
    },
    {
      name: "detect-no-viem",
      severity: "error",
      from: { path: "^packages/detect" },
      to: { path: "^packages/parse|^node_modules/viem" },
    },
    {
      name: "clients-no-parse",
      severity: "error",
      from: { path: "^packages/clients" },
      to: { path: "^packages/(parse|detect|orchestrator)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
