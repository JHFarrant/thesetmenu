"use client";

import { Card, Spinner } from "flowbite-react";
import { DateTime, Duration } from "luxon";
import {
  Page,
  Artist,
  TrackWithAlbum,
  Image,
} from "@spotify/web-api-ts-sdk/dist/mjs/types";

import { Favourite } from "@/types";
import Flow from "../components/glastomapper";

const TIME_SHIFT = 6; // hours

export const shiftedDay = (dateTime: DateTime) => {
  return dateTime
    .minus(Duration.fromObject({ hours: TIME_SHIFT }))
    .startOf("day");
};

export const getImage = (favourite: Favourite): Image => {
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

const FlowItinearry = ({
  itineraryInDays,
  favouriteArtists,
  artistsLoading,
}: any) => {
  // console.log("itineraryInDays")
  // console.log(itineraryInDays)
  return (
    <>
      {/* <div className="flex items-center justify-center">
        <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
          {"Your Glasto Set Menu 🔥"}
        </h5>
      </div> */}
      <div className="w-full">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {itineraryInDays.map((dayItinerary: any) => {
            const date = shiftedDay(dayItinerary[0]?.start);
            return (
              <div key={`DayHeader-${date}`}>
                <li className="py-3 sm:py-4">
                  <div className="items-center text-center  text-base font-semibold text-gray-900 dark:text-white">
                    {date?.toFormat("ccc")}
                  </div>
                </li>
                {!artistsLoading && (
                  <Flow
                    dayItinerary={dayItinerary}
                    favouriteArtists={favouriteArtists}
                  ></Flow>
                )}
              </div>
            );
          })}
          {/* {!!user && !topArtists.length && !artistsLoading &&  <div id={"connectAccount"} className={'flex flex-col align-center py-10'}>
  

  <Button color="dark" onClick={fetchAll}>                    
  <h2 className={`text-m font-semibold text-center`}>
          Load your Set Menu
      </h2>              
      </Button>
</div>
} */}
          {artistsLoading && (
            <div className="flex justify-center py-10">
              <Spinner aria-label="Extra large spinner example" size="xl" />
            </div>
          )}
          {!itineraryInDays.length && (
            <li className="py-3 sm:py-4">
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                    {"None of your top artists are playing at Glastonbury 😭"}
                  </p>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </>
  );
};

export default FlowItinearry;
