'use client';

import Image from 'next/image'
import ArtistList from './components/ArtistList'
import Search from './components/Search'

import { Button, Card, Footer } from 'flowbite-react';

export default function Home() {
  return (
    <>
    <main className="flex min-h-screen flex-col items-center justify-start pt-10">
      <div className={"px-5 flex-grow"} >
        <div id={"header"} className="relative flex place-items-center flex-col">
            <h1 className={`mb-3 text-3xl font-semibold text-center`}>
               Sets Menu
             </h1>
             <div>
             <p className={`mb-2 text-xs text-center opacity-50`}>
               You can't remember every artists name
             </p>

             </div>
             <Card href="#">
              <h5 className="text-m font-bold tracking-tight text-gray-900 dark:text-white">
                <p>
              Use your Spotify history to find your Glasto 23 'Sets Menu'
                </p>
              </h5>
              <p className="font-normal text-gray-700 dark:text-gray-400">
                <p>
                  Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
                </p>
              </p>
            </Card>
        </div>

        <div className="flex flex-col items-center flex-grow justify-start">
          
  {/*        <div id={"chooseFestival"} className={'justify-self-center pt-10'}>
            <h2 className={`text-m font-semibold opacity-50 text-left`}>
                      Choose your festival
                  </h2>
            <div
              className="mb-2 flex flex-col group rounded-lg border border-transparent px-5 py-4 text-center bg-neutral-800 bg-opacity-50 hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
                      >
                                           <div className={`text-m font-semibold opacity-80`}>
                  </div>
                       <Image src='/glasto.png' width="200" height="50"/>
                       <div className={`text-sm font-semibold `}>
                      Glastonbury 2023
                  </div>
            </div>
            <h2 className={`m-0 text-xs text-center opacity-50`}>
                More festivals coming soon...           
            </h2>
          </div>*/}


          {/*<ArtistList/>*/}
          <div id={"connectAccount"} className={'justify-self-center pt-10'}>
            <h2 className={`text-m font-semibold opacity-50 text-center pb-3`}>
                      Connect your account using
                  </h2>

              <Button color="dark">                    
                <Image src='/spotifylogo.png' width="200" height="50"/>
              </Button>
            <h2 className={`text-xs text-center opacity-50 pt-1`}>
                No data leaves your device            
            </h2>
          </div>

          {/*<a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
              Learn{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
              Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
          </a>*/}
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

</>
  )
}
