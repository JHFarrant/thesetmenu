"use client";

import { Button, Card, Spinner } from "flowbite-react";
import Footer from "../../components/footer";
import Header from "../../components/header"
const spotifyTokenStorageID =
  "spotify-sdk:AuthorizationCodeWithPKCEStrategy:token";

export default function Disclaimer() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start">
      <div className="self-end pr-2 pt-2 h-6"></div>
      <div className={"flex flex-col px-5 py-5 flex-grow"}>
        <Header/>
        <div className="flex flex-col flex-grow justify-center">
          <Card href="#">
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              <p>Disclaimer</p>
            </h5>
            <p className="font-normal text-gray-700 dark:text-gray-400">
                This website is not an official website of Spotify. It is an
                independent platform created for informational and entertainment
                purposes only. We are not affiliated, endorsed, or sponsored by
                Spotify or any of its subsidiaries. The content provided on this
                website does not reflect the views or opinions of Spotify or its
                employees. All product names, logos, and trademarks mentioned on
                this website are the property of their respective owners. We
                strive to provide accurate and up-to-date information, but we
                make no representations or warranties of any kind, express or
                implied, about the completeness, accuracy, reliability,
                suitability, or availability with respect to the website or the
                information, products, services, or related graphics contained
                on the website for any purpose. Any reliance you place on such
                information is therefore strictly at your own risk. In no event
                will we be liable for any loss or damage, including without
                limitation, indirect or consequential loss or damage, or any
                loss or damage whatsoever arising from loss of data or profits
                arising out of, or in connection with, the use of this website.
                By using this website, you acknowledge and agree to the terms
                stated in this disclaimer.
            </p>
          </Card>
        </div>
      </div>
      <Footer />
    </main>
  );
}
