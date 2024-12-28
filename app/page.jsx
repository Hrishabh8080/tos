import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";
import Carousel from "../components/Carousal/Carousal";
import CSS from "./page.module.css"
import About from "../components/About/About";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import OurClient from "../components/OurClient/OurClient";
import ContactForm from "../components/ContactForm/ContactForm";

export default function Home() {

  return (
    <section className={CSS.mainSection}>
      <Header />
      <Carousel />
      <About />
      <WhyChooseUs />
      <OurClient />
      <ContactForm />
      <Footer />
    </section>
  );
}
