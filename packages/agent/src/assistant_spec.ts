import type { ViewSpec } from "@beforesign/core";
import type { Spec } from "@beforesign/json-render-catalog";
import {
  appendElements,
  buildSpec,
  createElement,
  resetElementIds,
  validateSpec,
  type ViewElement,
} from "@beforesign/json-render-catalog";
import type { AskLocale } from "./types.ts";

export function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // continue
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      // continue
    }
  }

  return null;
}

export function isValidAssistantSpec(candidate: unknown): candidate is ViewSpec {
  if (!candidate || typeof candidate !== "object") return false;
  const spec = candidate as ViewSpec;
  if (typeof spec.root !== "string" || !spec.elements || typeof spec.elements !== "object") {
    return false;
  }
  return validateSpec(spec as unknown as Spec).valid;
}

export function parseAssistantSpec(text: string): ViewSpec | null {
  const json = extractJsonObject(text);
  if (!json || !isValidAssistantSpec(json)) return null;
  return json;
}

export function buildTextFallbackSpec(text: string, title: string): ViewSpec {
  resetElementIds();

  const elements: Record<string, ViewElement> = {};
  const card = createElement("Card", { title, description: null, badge: null });
  const stack = createElement("Stack", { gap: "md" });

  const paragraphs = text.trim().split(/\n\n+/).filter(Boolean);
  const chunks = paragraphs.length > 0 ? paragraphs : [text.trim()];
  const textIds: string[] = [];

  for (const chunk of chunks) {
    const normalized = chunk.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/^[-*]\s+/gm, "");
    const el = createElement("Text", { content: normalized, variant: "body" });
    textIds.push(el.id);
    appendElements(elements, [el]);
  }

  stack.element.children = textIds;
  card.element.children = [stack.id];
  appendElements(elements, [card, stack]);

  return buildSpec(card.id, elements) as unknown as ViewSpec;
}

export function resolveAssistantSpec(raw: string, locale: AskLocale): ViewSpec {
  const parsed = parseAssistantSpec(raw);
  if (parsed) return parsed;
  const title = locale === "zh" ? "解读" : "Explanation";
  return buildTextFallbackSpec(raw, title);
}
