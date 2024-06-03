"use client";

import { Card, Spinner } from "flowbite-react";
import { useState } from "react";
import { groupByLocation } from "@/utils/groupByLocation";

import { Event, Favorite, SelectedEvents } from "@/types";
import ArtistListItem from "@/components/ArtistListItem";
import { formatDayTitle } from "@/utils/stringUtils";
import { shiftedDay } from "@/utils/dateUtils";
import RecommendationSwitch from "@/components/RecommendationSwitch";
import { ShareDrawer } from "@/components/share/ShareDrawer";

type ItineraryInput = {
  itineraryInDays: Event[][];
  favoriteArtists: { [key: string]: Favorite };
  loadingSpotifyData: boolean;
  recommendationsEnabled: boolean;
  setRecommendationsEnabled: (value: boolean) => void;
  demoMode: boolean;
};

const Itinerary = ({
                     itineraryInDays,
                     favoriteArtists,
                     loadingSpotifyData,
                     recommendationsEnabled,
                     setRecommendationsEnabled,
                     demoMode
                   }: ItineraryInput) => {
  const [selectedEvents, setSelectedEvents] = useState<SelectedEvents>({});

  const toggleSelectedState = (id: string) => {
    const currentState: string = selectedEvents[id];
    const nextState =
      (currentState ?? "unselected") == "unselected"
        ? "selected"
        : "unselected";
    setSelectedEvents({ ...selectedEvents, [id]: nextState });
  };

  const atLeastOneSelected = Object.values(selectedEvents).some(
    (e) => e == "selected"
  );

  return (
    <>
      <Card>
        {<RecommendationSwitch
          enabled={!demoMode}
          recommendationsEnabled={recommendationsEnabled}
          setRecommendationsEnabled={setRecommendationsEnabled}
        />}
        <div className="flow-root">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {itineraryInDays.map((dailyItinerary: any) => {
              const date = shiftedDay(dailyItinerary[0]?.start);
              const eventsByLocation = groupByLocation(dailyItinerary);
              return (
                <div
                  key={`DayHeader-${date}`}
                  className="py-3 sm:py-4 first:pt-0 first:sm:pt-0"
                >
                  <li className="pb-4">
                    <div className="items-center text-left text-2xl font-semibold text-gray-900 dark:text-white">
                      {formatDayTitle(date, false, false)}
                    </div>
                  </li>
                  {Object.entries(eventsByLocation).map(([location, events]) => {
                    return (
                      <div key={location}>
                        <li className="flex flex-wrap space-x-2">
                          <div className="text-left text-m font-semibold text-gray-900 dark:text-white">
                            {location}
                          </div>
                        </li>
                        <div className="flex flex-wrap space-x-2">
                          {events.map((event) => {
                            return (
                              <ArtistListItem
                                key={event.id}
                                favourite={favoriteArtists[event.name]}
                                event={event}
                                demoMode={demoMode}
                                selectedEvents={selectedEvents}
                                toggleSelected={() => toggleSelectedState(event.id)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* {!!user && !topArtists.length && !loadingSpotifyData &&  <div id={"connectAccount"} className={'flex flex-col align-center py-10'}>


  <Button color="dark" onClick={fetchAll}>
  <h2 className={`text-m font-semibold text-center`}>
          Load your Set Menu
      </h2>
      </Button>
</div>
} */}
            {loadingSpotifyData && (
              <div className="flex justify-center py-10">
                <Spinner aria-label="Extra large spinner example" size="xl" />
              </div>
            )}
            {!itineraryInDays.length && (
              <li className="py-3 sm:py-4">
                <div className="flex items-center space-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {"None of your top artists are playing at Glasto 😭"}
                    </p>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </Card>
      {!demoMode && (
        <ShareDrawer
          atLeastOneSelected={atLeastOneSelected}
          itineraryInDays={itineraryInDays}
          selectedEvents={selectedEvents}
        />
      )}
    </>
  );
};

export default Itinerary;

