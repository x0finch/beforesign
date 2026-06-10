import {
  createFileRoute,
  Outlet,
  useMatch,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import * as React from "react";
import { AiPage } from "~/components/ai/ai_page.tsx";
import { useAsk } from "~/hooks/use_ask.ts";
import type { Locale } from "~/lib/i18n.ts";
import type { ConversationHydration } from "~/types/conversation.ts";

export const Route = createFileRoute("/_chat")({
  component: ChatLayout,
});

function ChatLayout() {
  const navigate = useNavigate();
  const convMatch = useMatch({ from: "/_chat/c/$conversationId", shouldThrow: false });
  const conversationId = convMatch?.params.conversationId;

  const convRouteState = useRouterState({
    select: (state) => {
      const match = state.matches.find(
        (entry) => entry.routeId === "/_chat/c/$conversationId",
      );
      if (!match) return undefined;
      return {
        hydration: match.loaderData as ConversationHydration | undefined,
        locale: (match.search as { locale?: Locale } | undefined)?.locale,
      };
    },
  });

  const hydration = convRouteState?.hydration;
  const [fallbackLocale, setFallbackLocale] = React.useState<Locale>("zh");
  const locale = convRouteState?.locale ?? fallbackLocale;

  const isConvHydrating = useRouterState({
    select: (state) => {
      const match = state.matches.find(
        (entry) => entry.routeId === "/_chat/c/$conversationId",
      );
      if (!match) return false;
      return match.status === "pending" || match.isFetching === "loader";
    },
  });

  const rawFromQuery = useRouterState({
    select: (state) => {
      const match = state.matches.find((entry) => entry.routeId === "/_chat/");
      return (match?.search as { raw?: string } | undefined)?.raw;
    },
  });

  React.useEffect(() => {
    if (rawFromQuery) {
      navigate({ to: "/", search: {}, replace: true });
    }
  }, [rawFromQuery, navigate]);

  const handleLocaleChange = (nextLocale: Locale) => {
    setFallbackLocale(nextLocale);
    if (conversationId) {
      navigate({
        to: "/c/$conversationId",
        params: { conversationId },
        search: { locale: nextLocale },
        replace: true,
      });
    }
  };

  const ask = useAsk({
    conversationId,
    hydration,
    isHydrating: isConvHydrating,
    locale,
    onConversationId: (id) => {
      navigate({
        to: "/c/$conversationId",
        params: { conversationId: id },
        search: { locale },
        replace: true,
      });
    },
  });

  return (
    <>
      <AiPage
        locale={locale}
        onLocaleChange={handleLocaleChange}
        initialRaw={rawFromQuery}
        ask={ask}
        onNewChat={() => navigate({ to: "/" })}
      />
      <Outlet />
    </>
  );
}
