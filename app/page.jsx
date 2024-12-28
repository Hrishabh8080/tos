import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import Carousel from "../components/Carousal/Carousal";
import CSS from "./page.module.css"
import About from "../components/About/About";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import OurClient from "../components/OurClient/OurClient";
import ContactForm from "../components/ContactForm/ContactForm";
import Testimonial from "@/components/Testimonial/Testimonial";

export const metadata = {
  title: 'Total Office Solutions | PVC, MS Pipes, Wires & Cables - TOSelectricals.com',
  description: 'Discover Total Office Solutions at TOSelectricals.com! Your go-to source for high-quality PVC & MS pipes, wires, cables, and switches. Shop now!',
  keywords: 'Total Office Solutions, electrical supplies, PVC pipes, MS pipes, electrical conduits, electrical cables, KEI wires, Polycab wires, Finolex wires, Havells wires, ABB distribution boards, Schneider MCBs, Legrand MCCBs, electrical switches, Anchor switch plates, Northwest sockets, TOSelectricals',
  openGraph: {
    title: 'Total Office Solutions | Premium PVC & MS Pipes, Wires & Cables',
    description: 'Explore Total Office Solutions at TOSelectricals.com for premium electrical solutions!',
    url: 'https://www.toselectricals.com',
  },
};


export default function Home() {
  return (
    <section className={CSS.mainSection}>
      <Header />
      <Carousel />
      <About />
      <WhyChooseUs />
      <OurClient type={1} />
      <Testimonial />
      <OurClient type={2} />
      <ContactForm />
      <Footer />
    </section>
  );
}
