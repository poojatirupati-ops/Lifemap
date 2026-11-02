import type { CloudEvent } from "cloudevents";
import type { EventBus } from "../bus";

/** Dev and tests: keeps the events in `published` and logs their type and id. */
export const memoryBus = () => {
  const published: CloudEvent<unknown>[] = [];
  return {
    published,
    publish: async (events) => {
      published.push(...events);
      for (const e of events) console.log(`[event] ${e.type} ${e.id}`);
    },
  } satisfies EventBus & { published: CloudEvent<unknown>[] };
};
