import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { coreComponentDefinitions } from "./components/core.ts";

export const catalog = defineCatalog(schema, {
  components: coreComponentDefinitions,
  actions: {},
});

export type Catalog = typeof catalog;

export const componentNames = catalog.componentNames;

export const actionNames = catalog.actionNames;
