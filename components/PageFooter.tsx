import React from "react";

import { Footer } from "flowbite-react";

const PageFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Footer container>
      <div className="w-full flex justify-between items-center p-4">
        <Footer.Copyright
          by="My Glasto Set Menu"
          href="/"
          year={currentYear}
        />
        <Footer.LinkGroup>
          <Footer.Link href="/disclaimer">Disclaimer</Footer.Link>
          <Footer.Link href="mailto:jhfarrant@gmail.com">Contact</Footer.Link>
        </Footer.LinkGroup>
      </div>
    </Footer>
  );
};

export default PageFooter;
