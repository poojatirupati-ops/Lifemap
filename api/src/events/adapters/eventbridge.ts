import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
import type { CloudEvent } from "cloudevents";
import type { EventBus } from "../bus";

/**
 * Amazon EventBridge: one PutEvents entry per CloudEvent. Source = the CloudEvent source with "/" as "." (lifemap/bookings -> lifemap.bookings),
 * detail-type = its type, detail = the whole CloudEvent (JSON), so consumers read the same envelope as on any other broker.
 */
export const eventBridgeBus = (busName: string, client = new EventBridgeClient({ region: "eu-west-1" })): EventBus => ({
  publish: async (events: CloudEvent<unknown>[]) => {
    const { FailedEntryCount, Entries } = await client.send(new PutEventsCommand({
      Entries: events.map((e) => ({ EventBusName: busName, Source: e.source.replaceAll("/", "."), DetailType: e.type, Time: e.time ? new Date(e.time) : undefined, Detail: JSON.stringify(e.toJSON()) })),
    }));
    if (FailedEntryCount) throw new Error(`PutEvents: ${FailedEntryCount} failed (${Entries?.find((x) => x.ErrorCode)?.ErrorCode})`);
  },
});
