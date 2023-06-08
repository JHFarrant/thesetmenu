'use client';

import {useEffect, useState, useMemo} from 'react'
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { Page, Artist, TrackWithAlbum, Image} from '@spotify/web-api-ts-sdk/dist/mjs/types';

import g2023SpotifyIDsJson from '../public/g2023SpotifyIDs.json';
import g2023 from '../public/g2023.json';
import moment from 'moment';

import { Button, Card, Footer, Spinner } from 'flowbite-react';
import { useReadLocalStorage } from 'usehooks-ts'

const spotifyTokenStorageID = 'spotify-sdk:AuthorizationCodeWithPKCEStrategy:token'

type Favorite = {
  artist: Artist
  track?: TrackWithAlbum
  setName: string
}

const removeDupes = (totalArray: any[]) => {
  let uniqueArray: any[]  = []
  totalArray.forEach(x => {
    if(!uniqueArray.some(y => y.setName === x.setName)){
      uniqueArray.push(x)
    }
  })
  return uniqueArray
}

const getImage = (favourite: Favorite): Image => {
    console.log(favourite)
    const artistImage = favourite.artist.images && favourite.artist.images.find((i: Image) => (i.width <= 600))
    if(artistImage){return artistImage}
    const albumImage = favourite.track?.album?.images && favourite.track.album.images.find((i: Image) => (i.width <= 600))
  return albumImage || {url: "disc.png", width:512, height:512 }
}


export default function Home() {

  const spotifyKeys: any = useReadLocalStorage(spotifyTokenStorageID)

  const SpotifyClientID = "7116f40f98d64f5cbb9e2aafb2209702"
  const ThisURL = typeof window !== "undefined" ?  window.location.origin + "/" : "RedirectURLUnknown"

  console.log(`RedirectURL=${ThisURL}`)


  const sdk = useMemo(() => SpotifyApi.withUserAuthorization(SpotifyClientID, ThisURL, ["user-top-read"]),[]);

  // const [sdk, setSDK] = useState<SpotifyApi>()
  const [user, setUser] = useState<any>()

  
  const [artistsLoading, setArtistsLoading] = useState<boolean>(false)
  const [tracksLoading, setTracksLoading] = useState<boolean>(false)
  const [intialLoadDone, setInitialLoadDone] = useState<boolean>(false)

  
  const [topArtists, setTopArtists] = useState<Artist[]>([])
  const [topTracks, setTopTracks] = useState<TrackWithAlbum[]>([])

  const share = () => {
    if (navigator.share) {
      navigator.share({
        title: 'The Set Menu',
        url: 'https://thesetmenu.co.uk'
      }).then(() => {
        console.log('Share success');
      })
      .catch(console.error);
    } else {
      console.log('Native sharing unavailable');
      window.open("whatsapp://send?text=The Set Menu - https://thesetmenu.co.uk");
    } 
  }

  const logout = () => {
    typeof window !== "undefined" 
    window.localStorage.removeItem(spotifyTokenStorageID)
    window.location.reload()
  }
  // const isAuth = () => {
  //   sdk?.currentUser.topItems("artists")
  // }

  const performSpotifyAuth = async () => {
    console.log("Triggered Auth - Started")
    // setSDK(sdk)
    await sdk.authenticate()
    console.log("Triggered Auth - Finished")
  }

  const fetchAll = () => {
    const fetchArtists = async () => {
      console.log("Fetching artists")
      // const artistsPage = await sdk.currentUser.topItems("artists")
      const offset  = 0
      const timeRange = "medium_term"
      // const shortTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=short_term`)
      // const shortTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=short_term`)
      const mediumTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=medium_term`)
      const mediumTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=medium_term`)
      const longTerm1 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=0&time_range=long_term`)
      const longTerm2 = sdk.makeRequest<Promise<Page<Artist>>>("GET", `me/top/artists?limit=50&offset=49&time_range=long_term`)
      try{
        const artistsPage = await Promise.all([mediumTerm1, mediumTerm2, longTerm1, longTerm2])
        setTopArtists(artistsPage.reduce((artists,a)=> artists.concat(a.items) ,[] as Array<any> ))
      }
      catch (error){
          console.error(error)
      }
      setArtistsLoading(false)
    }
    const fetchTracks = async () => {
      console.log("Fetching tracks")
      // const artistsPage = await sdk.currentUser.topItems("artists")
      const offset  = 0
      const timeRange = "medium_term"
      // const shortTerm1 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=short_term`)
      // const shortTerm2 = sdk.makeRequest<Promise<Page<Track>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=short_term`)
      const mediumTerm1 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=medium_term`)
      const mediumTerm2 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=medium_term`)
      const longTerm1 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>("GET", `me/top/tracks?limit=50&offset=0&time_range=long_term`)
      const longTerm2 = sdk.makeRequest<Promise<Page<TrackWithAlbum>>>("GET", `me/top/tracks?limit=50&offset=49&time_range=long_term`)
      
      try{
        const tracksPage = await Promise.all([ mediumTerm1, mediumTerm2, longTerm1, longTerm2])
        setTopTracks(tracksPage.reduce((tracks,a)=> tracks.concat(a.items) ,[] as Array<any>))
      }
      catch (error){
          console.error(error)
      }
      setTracksLoading(false)

    }
    setArtistsLoading(true)
    setTopArtists([])
    fetchArtists().catch(console.error)

    setTracksLoading(true)
    setTopTracks([])
    fetchTracks().catch(console.error)

  }
  const g2023SpotifyIDs: any = g2023SpotifyIDsJson
  const glastoIDs: any = Object.keys(g2023SpotifyIDs)
  const matchedArtists = topArtists.filter(a => glastoIDs.includes(a.id)).map(a=> ({artist: a, setName: g2023SpotifyIDs[a.id]}))
  const matchedArtistsWithTracks = topTracks.reduce((artists, t) => ({...artists, ...t.artists.filter(a => glastoIDs.includes(a.id)).reduce((trackArtists, a) => ({...trackArtists, [a.id]: {track: t, artist: a, setName: g2023SpotifyIDs[a.id]}}),{})  }), {})

  const processCFjson = (json: any) => {
    const events = json.locations.reduce((events: any, location: any) => events.concat(location.events.map((e: any) => ({...e, location: location.name}))), [] )
    return events.reduce((artistEvents: any, e: any) => ({...artistEvents, [e.name]: {events: [e].concat(artistEvents[e.name]?.events ?? [])}}),{}) 
    }
  
  const favoriteArtists = removeDupes(matchedArtists.concat(Object.values(matchedArtistsWithTracks)))
  favoriteArtists.sort((a,b)=> b.artist.popularity - a.artist.popularity)
    
  
  useEffect(() => {
    console.log(`spotifyKeys=${spotifyKeys}`)
    const initSpotify = async () => {
      const hashParams = new URLSearchParams(window.location.search);
      const code = hashParams.get("code");
      console.log("Initialising...")
      if(!!spotifyKeys?.access_token || code){
        console.log("Initialising..., getting spotify user")
        sdk.currentUser.profile().then((user) =>{
          console.log("Initialising..., got spotify user")
          setUser(user)
          setInitialLoadDone(true)
          fetchAll()
        }).catch(error => {
          console.error("Initialising..., Failed to get spotify user")
          setUser(undefined); 
          setInitialLoadDone(true); 
          console.error(error)
        })
      }else{
        console.log("Initialising..., skipping get spotify user, no token detected")
        setUser(undefined); 
        setInitialLoadDone(true)
      }
    }
    initSpotify()
  }, [])
  
  const eventsByArtist = processCFjson(g2023)

  console.log("Finishing Render...")
  console.log(`artistsLoading=${artistsLoading}`)
  console.log(`tracksLoading=${tracksLoading}`)
  console.log(`topArtists=${topArtists}`)
  console.log(`user=${user}`)

  
  return intialLoadDone ? (
    <main className="flex min-h-screen w-full flex-col items-center justify-start">
      <div className='self-end pr-2 pt-2 h-6'>
          { user && <a
      className="text-xs font-medium hover:underline dark:text-cyan-500"
      href="#"
      onClick={logout}
    >
      <p>
        Log out
      </p>
    </a> }
    </div> 
      <div className={"px-5 py-5 flex-grow"} >
        <div id={"header"} className="relative flex place-items-center flex-col mb-5">
            <h1 className={`mb-3 text-3xl font-semibold text-center`}>
               The Set Menu
             </h1>
             <div>
             <p className={`text-xs text-center opacity-50`}>
               {"You can't remember every artists name"}
             </p>
             </div>

        </div>

        <div className="flex flex-col items-center flex-grow justify-start">


        { !user && 
          < div>
              <h5 className="text-l lg:text-5xl drop-shadow-2xl font-bold text-center tracking-tight text-gray-900 dark:text-white">
                
                  {"Use your Spotify history to discover your"}
              
              </h5>
              <h5 className="text-l lg:text-5xl drop-shadow-2xl font-bold text-center tracking-tight text-gray-900 dark:text-white">
                
                {"Glasto 23 Set Menu"}
            
            </h5>
              
            </div>
           }

                  {/* <div id={"chooseFestival"} className={'justify-self-center pt-10'}>
                    <h2 className={`text-m font-semibold opacity-50 text-left`}>
                              Choose your festival
                          </h2>
                    <div
                      className="mb-2 flex flex-col group rounded-lg border border-transparent px-5 py-4 text-center bg-neutral-800 bg-opacity-50 hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                              >
                        <div className={`text-m font-semibold opacity-80`}>
                        </div>
                            <img src='/glasto.png' width="200" height="50"/>
                            <div className={`text-sm font-semibold `}>
                              Glastonbury 2023
                          </div>
                    </div>
                    <h2 className={`m-0 text-xs text-center opacity-50`}>
                        More festivals coming soon...           
                    </h2>
                  </div> */}
                  
          
         { !user && <div id={"connectAccount"} className={'justify-self-center pt-10'}>
         <h2 className={`text-m font-semibold opacity-50 text-center pb-3`}>
                      Connect your account using
                  </h2>

              <Button color="dark" onClick={performSpotifyAuth}>                    
                <img alt="spotify logo" src='/spotifylogo.png' width="200" height="50"/>
              </Button>
            <h2 className={`text-xs text-center opacity-50 pt-1`}>
                No data leaves your device            
            </h2>
           
        </div> 
          }
   

  { user &&  <Card>
  <div className="flex items-center justify-between">
    <h5 className="text-xl font-bold leading-none text-gray-900 dark:text-white">
      {user.display_name}{"'s Glasto Set Menu 🔥"}
    </h5>
  </div>
  <div className="flow-root">
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {favoriteArtists.map((favourite => 
      <li key={favourite.artist.id} className="py-3 sm:py-4">
        <div className="flex space-x-2 "> 
        <div className="shrink-0">
            <img
              alt={favourite.artist.name}
              // className="rounded-full"
              // height="32"
              src={getImage(favourite).url}
              width="100"
            />
          </div>
        <div className="flex flex-col space-y-2 items-left w-full justify-between"> 
          {/* <div className='flex' > */}
          <div className='flex flex-col'>
            <div>
              <p className="truncate text-sm font-medium text-left   text-gray-900 dark:text-white">
                {favourite.setName}
              </p>
            </div>
            <div className="items-center text-left  text-base font-semibold text-gray-900 dark:text-white">
              {eventsByArtist[favourite.setName]?.events.map((e: any) =>(<p key={`${e.start}-${e.end}-${e.location}`} className="truncate text-sm text-gray-500 dark:text-gray-400">
                  {e.location}{" @ "}{moment(e.start).format('ddd')}{" "}{moment(e.start).format('ha')}
                  </p>))}
            </div>
          </div>
            <div className='flex w-full justify-end'>
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
      ))}
      {/* {!!user && !topArtists.length && !artistsLoading &&  <div id={"connectAccount"} className={'flex flex-col align-center py-10'}>
            

            <Button color="dark" onClick={fetchAll}>                    
            <h2 className={`text-m font-semibold text-center`}>
                    Load your Set Menu
                </h2>              
                </Button>
        </div>
        } */}
        {artistsLoading && 
        <div className="flex justify-center py-10">
        <Spinner
          aria-label="Extra large spinner example"
          size="xl"
        /></div>}
      {!matchedArtists.length && !!topArtists.length && <li className="py-3 sm:py-4">
        <div className="flex items-center space-x-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
              {"None of your top artists are playing at Glastonbury 😭"}
            </p>
          </div>
        </div>
      </li>}
    </ul>
  </div>
</Card>
}
<div className='flex items-center space-x-2 pt-5'>
  <h2 className={`text-m font-semibold opacity-50 text-center`}>
      If you liked this then
  </h2>
<Button color="dark" onClick={share}>                    
  <h1 className={`text-m font-semibold text-center`}>Share</h1>
</Button>
  <h2 className={`text-m font-semibold opacity-50 text-center`}>
    it with mates
  </h2>
</div>
          </div>
      </div>
      <Footer bgDark>
        <div className="w-full">
          <div className="w-full bg-gray-700 px-4 py-6 sm:flex sm:items-center sm:justify-between">
            <Footer.Copyright
              by="Jack Farrant"
              href="#"
              year={2023}
            />

          </div>
        </div>
      </Footer>
    </main>
) :  <main className="flex min-h-screen w-full flex-col items-center justify-center">
        <Spinner
          aria-label="Extra large spinner example"
          size="xl"
        />
  </main>
}
