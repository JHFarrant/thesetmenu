import { getImage } from "./itinerary";
import { Position, Handle } from "reactflow";
import { Button, Card, Spinner } from "flowbite-react";

const EventNode = (params: any) => {
  console.log(`event node= ${params}`);
  const {
    data: { event, favourite, nodeHeight, nodeWidth },
  } = params;
  return (
    <>
      <Handle style={{ opacity: 0 }} type="target" position={Position.Top} />
      <Card style={{ height: nodeHeight, width: nodeWidth }}>
        <div>
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
                  {/* <p className="text-sm text-gray-500 dark:text-gray-400">
              {event.start.toFormat("cccc")}{" "}
            </p> */}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.start.toFormat("h:mma")}
                    {" - "}
                    {event.end.toFormat("h:mma")}
                  </p>
                  {/* ) */}
                  {/* )} */}
                </div>
              </div>
              <div className="flex w-full justify-end">
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
        </div>
      </Card>
      <Handle style={{ opacity: 0 }} type="source" position={Position.Bottom} />
    </>
  );
};

export default EventNode;
