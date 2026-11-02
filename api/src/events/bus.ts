import type { CloudEvent } from "cloudevents";
import { memoryBus } from "./adapters/memory";

/** Nest token for the EventBus (EventsModule). */
export const EVENT_BUS = "EventBus";

/** Publishes CloudEvents to a broker. Resolves only once the broker has taken every event; throws otherwise. */
export interface EventBus {
  publish(events: CloudEvent<unknown>[]): Promise<void>;
}

/**
 * EVENT_BUS=eventbridge|memory. Outside production the default is memory. Production only ever uses eventbridge with EVENT_BUS_NAME set;
 * anything else fails closed (every publish throws, so Cal.com retries the webhook). Another broker is one more file in adapters/.
 */
export const eventBus = async (env = process.env): Promise<EventBus> => {
  const prod = env.NODE_ENV === "production";
  const mode = env.EVENT_BUS ?? (prod ? "eventbridge" : "memory");
  if (mode === "memory" && !prod) return memoryBus();
  if (mode === "eventbridge" && env.EVENT_BUS_NAME) return (await import("./adapters/eventbridge")).eventBridgeBus(env.EVENT_BUS_NAME);
  return {
    publish: async () => {
      throw new Error("event bus not configured: set EVENT_BUS=eventbridge and EVENT_BUS_NAME");
    },
  };
};
