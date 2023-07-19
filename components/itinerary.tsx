"use client";

import { Card, Spinner, Badge, ToggleSwitch, Tooltip } from "flowbite-react";
import { HiInformationCircle } from "react-icons/hi";

import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import { Favorite } from "@/types";
import RecommendationsEndpoints from "@spotify/web-api-ts-sdk/dist/mjs/endpoints/RecommendationsEndpoints";

const TIME_SHIFT = 6; // hours

export const shiftedDay = (dateTime: moment.Moment) => {
  let out = dateTime.clone();
  out.subtract(TIME_SHIFT, "hours").startOf("day");
  return out;
};

const getImage = (favourite: Favorite): Image => {
  // console.log(favourite);
  const artistImage =
    favourite.artist.images &&
    favourite.artist.images.find((i: Image) => i.width <= 600);
  if (artistImage) {
    return artistImage;
  }
  const albumImage =
    favourite.track?.album?.images &&
    favourite.track.album.images.find((i: Image) => i.width <= 600);
  return albumImage || { url: "disc.png", width: 512, height: 512 };
};

const Itinearry = ({
  itineraryInDays,
  favoriteArtists,
  loadingSpotifyData,
  recommendationsEnabled,
  setRecommendationsEnabled,
}: any) => {
  return (
    <Card>
      <div className="flex items-center justify-center">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {"Your SGP Set Menu 🔥"}
        </h5>
      </div>
      {!!setRecommendationsEnabled && (
        <div className="min-w-150">
          <ToggleSwitch
            checked={recommendationsEnabled}
            label="Suggest similar artists"
            onChange={() => setRecommendationsEnabled(!recommendationsEnabled)}
          />
        </div>
      )}
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {itineraryInDays.map((dailyItinerary: any) => {
            const date = shiftedDay(dailyItinerary[0]?.start);
            return (
              <div key={`DayHeader-${date}`}>
                <li className="py-3 sm:py-4">
                  <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
                    {date?.format("ddd")}
                  </div>
                </li>
                {dailyItinerary.map((event: any) => {
                  const favourite = favoriteArtists[event.name];
                  return (
                    <li
                      key={`${event.location}-${event.start}-${event.name}`}
                      className="py-3 sm:py-4"
                    >
                      <div className="flex space-x-2 ">
                        <div className="shrink-0">
                          <img
                            alt={favourite.artist.name}
                            src={getImage(favourite).url}
                            width="100"
                          />
                        </div>
                        <div className="flex flex-col space-y-2 items-left w-full justify-between">
                          {/* <div className='flex' > */}
                          <div className="flex flex-col">
                            <div>
                              <p className="text-sm font-medium text-left   text-gray-900 dark:text-white">
                                {favourite.setName}
                              </p>
                            </div>
                            <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
                              {/* {eventsByArtist[favourite.setName]?.events.map( */}
                              {/* (e: any) => ( */}
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {event.location}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {event.start.format("ddd")}{" "}
                                {event.start.format("h:mma")}
                              </p>
                              {/* ) */}
                              {/* )} */}
                            </div>
                          </div>
                          <div className="flex w-full justify-end space-x-2">
                            {favourite.relatedArtistName && (
                              <div>
                                <Tooltip
                                  content={`Recommended because you listen to ${favourite.relatedArtistName}`}
                                >
                                  <Badge
                                    icon={HiInformationCircle}
                                    color="info"
                                  >
                                    {"Why?"}
                                  </Badge>
                                </Tooltip>
                              </div>
                            )}
                            <a href={favourite.artist.external_urls.spotify}>
                              <img
                                alt={favourite.artist.name}
                                // className="rounded-full"
                                // height="32"
                                src="spotifylogosmallblack.png"
                                width="25"
                              />
                            </a>
                          </div>
                          {/* </div> */}
                        </div>
                      </div>
                    </li>
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
                    {"None of your top artists are playing at SGP 😭"}
                  </p>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </Card>
  );
};

export default Itinearry;
