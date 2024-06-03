import { Moment } from "moment";

const emojis: any = {
  Wednesday: "🍄",
  Thursday: "🦄",
  Friday: "🎸",
  Saturday: "🎤",
  Sunday: "🎷"
};

export const formatDayTitle = (date: Moment, prependEmoji: boolean, boldDate: boolean) => {
  const day = date.format("dddd");
  const emoji = emojis[day];
  let title = prependEmoji ? `${emoji} ` : "";
  title += boldDate ? `<b>${date.format("dddd")}</b>` : date.format("dddd");
  title += ` ${emoji}`;
  return title;
};
