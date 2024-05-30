import { memo } from "react";

import Typing from "react-typing-animation";

import { Event } from "@/types";

const getEventString = (event: Event) => {
  return (
    <div className="border-l-4 border-gray-600 pl-2 mt-1">
      <span className="font-mono">{event.start.format("h:mma")}</span>{" "}
      {event.name}
      {" @ "}
      <i>{event.location}</i>
    </div>
  );
};

const emojis: any = {
  Wednesday: "🍄",
  Thursday: "🦄",
  Friday: "🎸",
  Saturday: "🎤",
  Sunday: "🎷",
};

const TIME_SHIFT = 6; // hours

export const shiftedDay = (dateTime: moment.Moment) => {
  let out = dateTime.clone();
  out.subtract(TIME_SHIFT, "hours").startOf("day");
  return out;
};

const WhatsappText = ({
  itineraryInDays,
  selectedEvents,
}: {
  itineraryInDays: any;
  selectedEvents: any;
}) => {
  return (
    <>
      <p key={"MyGlastoSetMenuTitle"}>
        📀{" "}
        <span className="text-blue-500 underline">MyGlastoSetMenu.co.uk</span>
      </p>
      {itineraryInDays.map((dailyItinerary: any) => {
        const date = shiftedDay(dailyItinerary[0]?.start);
        const fiteredDailyItinerary = dailyItinerary.filter(
          (e: Event) =>
            selectedEvents[e.id] && selectedEvents[e.id] == "selected"
        );
        if (fiteredDailyItinerary.length) {
          return (
            <div key={date?.format("dddd")}>
              <p>
                {emojis[date?.format("dddd")]} <b>{date?.format("dddd")}</b>{" "}
                {emojis[date?.format("dddd")]}
              </p>
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
