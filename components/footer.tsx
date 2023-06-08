import { Footer } from "flowbite-react";

const PageFooter = () => (
  <Footer container>
    <Footer.Copyright by="The Set Menu" href="/" year={2023} />
    <Footer.LinkGroup>
      {/* <Footer.Link href="#">About</Footer.Link> */}
      <Footer.Link href="disclaimer">Disclaimer</Footer.Link>
      <Footer.Link href="mailto:jhfarrant@gmail.com">Contact</Footer.Link>
    </Footer.LinkGroup>
  </Footer>
);

export default PageFooter;
