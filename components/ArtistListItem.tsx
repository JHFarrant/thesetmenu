import { Event, Favorite, SelectedEvents } from "@/types";
import { HiSparkles } from "react-icons/hi";
import { Badge, Tooltip } from "flowbite-react";
import ArtistSelectButton from "@/components/ArtistSelectButton";
import { Image } from "@spotify/web-api-ts-sdk/dist/mjs/types";

const getImage = (favourite: Favorite): Image => {
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

const ArtistListItem = ({
                          favourite,
                          event,
                          demoMode,
                          selectedEvents,
                          toggleSelected
                        }: {
  favourite: Favorite,
  event: Event,
  demoMode: boolean,
  selectedEvents: SelectedEvents,
  toggleSelected: () => void
}) => {
  return (<li className="py-3 sm:py-4">
    <div id="artistListItem" className="flex space-x-2 p-1">
      <div id="artistImage" className="shrink-0">
        <img
          alt={favourite.artist.name}
          src={getImage(favourite).url}
          width="100"
        />
      </div>
      <div
        id="artistInfo"
        className="flex flex-col space-y-2 items-start justify-between w-full"
      >
        <div className="flex flex-col pt-1">
          {favourite.relatedArtistName && (
            <div id="whyRecommendationBadge">
              <Tooltip content={`Recommended because you listen to ${favourite.relatedArtistName}`}>
                <Badge icon={HiSparkles} size="sm" color="info">Recommended</Badge>
              </Tooltip>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {event.start.format("ddd")}{" "}
              {event.start.format("h:mma")}
            </p>
            <p className="text-sm font-medium text-left   text-gray-900 dark:text-white">
              {favourite.setName}
            </p>
          </div>
          <div
            className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
            {/* {eventsByArtist[favourite.setName]?.events.map( */}
            {/* (e: any) => ( */}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {event.location}
            </p>

            {/* ) */}
            {/* )} */}
          </div>
        </div>
        {!demoMode && (
          <div className="flex w-full items-center space-x-2">
            <div id="spotifyIconArtistLink">
              <a
                href={favourite.artist.external_urls.spotify}
                target="_blank"
              >
                <img
                  className="block dark:hidden"
                  alt={favourite.artist.name}
                  // className="rounded-full"
                  // height="32"
                  src="spotifylogosmallblack.png"
                  width="25"
                />
                <img
                  className="hidden dark:block"
                  alt={favourite.artist.name}
                  // className="rounded-full"
                  // height="32"
                  src="spotifylogosmallgreen.png"
                  width="25"
                />
              </a>
            </div>
            <ArtistSelectButton
              selectionState={selectedEvents[event.id]}
              toggleSelected={toggleSelected}
            />
          </div>
        )}
      </div>
    </div>
  </li>)
    ;
};

export default ArtistListItem;
