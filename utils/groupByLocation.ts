import { Event } from "@/types";

interface EventsByLocation {
  [location: string]: Event[];
}

export const groupByLocation = (events: Event[]): EventsByLocation => {
  return events.reduce<EventsByLocation>((acc, event) => {
    const { location } = event;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(event);
    return acc;
  }, {});
};
