import { Moment } from "moment";

const TIME_SHIFT = 6; // hours

export const shiftedDay = (dateTime: Moment) => {
  let out = dateTime.clone();
  out.subtract(TIME_SHIFT, "hours").startOf("day");
  return out;
};
