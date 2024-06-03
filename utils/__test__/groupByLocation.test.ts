import { groupByLocation } from "../groupByLocation";
import { Event } from "@/types";
import moment from "moment";

// Mock Event data for testing
const events: Event[] = [
  {
    id: "1",
    start: moment("2023-06-01T10:00:00"),
    end: moment("2023-06-01T12:00:00"),
    name: "Event 1",
    location: "New York"
  },
  {
    id: "2",
    start: moment("2023-06-02T11:00:00"),
    end: moment("2023-06-02T13:00:00"),
    name: "Event 2",
    location: "Los Angeles"
  },
  {
    id: "3",
    start: moment("2023-06-01T14:00:00"),
    end: moment("2023-06-01T16:00:00"),
    name: "Event 3",
    location: "New York"
  },
  {
    id: "4",
    start: moment("2023-06-03T09:00:00"),
    end: moment("2023-06-03T11:00:00"),
    name: "Event 4",
    location: "Chicago"
  },
  {
    id: "5",
    start: moment("2023-06-02T15:00:00"),
    end: moment("2023-06-02T17:00:00"),
    name: "Event 5",
    location: "Los Angeles"
  }
];

describe('groupByLocation', () => {
  it('should group events by location', () => {
    const groupedEvents = groupByLocation(events);

    expect(groupedEvents).toEqual({
      'New York': [
        { id: '1', start: moment('2023-06-01T10:00:00'), end: moment('2023-06-01T12:00:00'), name: 'Event 1', location: 'New York' },
        { id: '3', start: moment('2023-06-01T14:00:00'), end: moment('2023-06-01T16:00:00'), name: 'Event 3', location: 'New York' },
      ],
      'Los Angeles': [
        { id: '2', start: moment('2023-06-02T11:00:00'), end: moment('2023-06-02T13:00:00'), name: 'Event 2', location: 'Los Angeles' },
        { id: '5', start: moment('2023-06-02T15:00:00'), end: moment('2023-06-02T17:00:00'), name: 'Event 5', location: 'Los Angeles' },
      ],
      'Chicago': [
        { id: '4', start: moment('2023-06-03T09:00:00'), end: moment('2023-06-03T11:00:00'), name: 'Event 4', location: 'Chicago' },
      ],
    });
  });

  it('should handle an empty array', () => {
    const groupedEvents = groupByLocation([]);

    expect(groupedEvents).toEqual({});
  });

  it('should handle an array with one event', () => {
    const singleEvent = [
      { id: '1', start: moment('2023-06-01T10:00:00'), end: moment('2023-06-01T12:00:00'), name: 'Event 1', location: 'New York' }
    ];
    const groupedEvents = groupByLocation(singleEvent);

    expect(groupedEvents).toEqual({
      'New York': [{ id: '1', start: moment('2023-06-01T10:00:00'), end: moment('2023-06-01T12:00:00'), name: 'Event 1', location: 'New York' }],
    });
  });
});
