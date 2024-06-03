import Typing from "react-typing-animation";

import { Event, SelectedEvents } from "@/types";
import { formatDayTitle } from "@/utils/stringUtils";
import { shiftedDay } from "@/utils/dateUtils";

const getEventString = (event: Event) => {
  return (
    <div className="border-l-4 border-gray-600 pl-2 mt-1">
      <p className="text-wa-message-primary dark:text-wa-message-primary-dark">
        <span className="font-mono">{event.start.format("h:mma")}</span>{" "}
        {event.name}
        {" @ "}
        <i>{event.location}</i>
      </p>
    </div>
  );
};

const WhatsappText = ({
                        itineraryInDays,
                        selectedEvents
                      }: {
  itineraryInDays: Event[][];
  selectedEvents: SelectedEvents;
}) => {
  return (
    <>
      <p key={"MyGlastoSetMenuTitle"}>
        📀{" "}
        <span className="text-wa-link dark:text-wa-link-dark underline">
          MyGlastoSetMenu.co.uk
        </span>
      </p>
      {itineraryInDays.map((dailyItinerary: any) => {
        const date = shiftedDay(dailyItinerary[0]?.start);
        const fiteredDailyItinerary = dailyItinerary.filter(
          (e: Event) => selectedEvents[e.id] && selectedEvents[e.id]
        );
        if (fiteredDailyItinerary.length) {
          return (
            <div key={date?.format("dddd")}>
              <p>{formatDayTitle(date, true, true)}</p>
              {fiteredDailyItinerary.map((event: any) => {
                return (
                  <div key={event.id}>
                    <Typing speed={10}>{getEventString(event)}</Typing>
                  </div>
                );
              })}
            </div>
          );
        }
      })}
    </>
  );
};

export default WhatsappText;
