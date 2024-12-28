import React from 'react';
import styles from './WhyChooseUs.module.css';
import Quality from "../../assets/svg/Quality.svg";
import Timely from "../../assets/svg/Timely.svg";
import Customer from "../../assets/svg/Customer.svg";
import Industry from "../../assets/svg/Industry.svg";
import Cost from "../../assets/svg/Cost.svg";
import Sustainability from "../../assets/svg/Sustainability.svg";
import Image from 'next/image';

const qualityAttributes = [
    {
        key: "Quality Assurance",
        value: "We prioritize product quality, offering only tested, certified, and reliable items that meet international safety standards.",
        svg: Quality

    },
    {
        key: "Timely Delivery",
        value: "Our efficient supply chain and project packing services ensure that orders are delivered promptly and safely, no matter the scale.",
        svg: Timely
    },
    {
        key: "Customer-Centric Approach",
        value: "We take pride in understanding our clients’ needs, offering tailored solutions, and providing responsive customer support.",
        svg: Customer
    },
    {
        key: "Industry Expertise",
        value: "With over 10 years of experience, we are trusted by businesses and contractors across industries to deliver the best products for their projects.",
        svg: Industry
    },
    {
        key: "Cost Efficiency",
        value: "We provide competitive pricing without compromising on quality, ensuring that customers get the best value for their investment.",
        svg: Cost
    },
    {
        key: "Sustainability",
        value: "We are committed to eco-friendly practices, ensuring our products are produced and distributed with minimal environmental impact.",
        svg: Sustainability
    }
];

const WhyChooseUs = () => {
    return (
        <section id='why-choose-us' className={styles.whyChooseUs}>
            <div className={styles.head}>Why Choose Us</div>
            <div className={styles.container}>

                {qualityAttributes.map((attribute, index) => {
                    return (
                        <div key={index} className={styles.card}>
                            <div className={styles.overlay}></div>
                            <div className={styles.circle}>
                                <Image className={styles.image} width={50} src={attribute.svg} alt="Quality" />
                            </div>
                            <div className={styles.itemhead}>{attribute.key}</div>
                            <div className={styles.subtext}>
                                {attribute.value}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default WhyChooseUs;
