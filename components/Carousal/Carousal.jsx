"use client";
import React, { useState, useEffect } from "react";
import styles from "./Carousel.module.css"; // Import the CSS module

import Img1 from "../../assets/images/01.jpeg";
import Img2 from "../../assets/images/02.jpeg";
import Img3 from "../../assets/images/03.jpeg";
import Img4 from "../../assets/images/04.jpeg";
import Img5 from "../../assets/images/05.jpeg";
import Img6 from "../../assets/images/06.jpeg";
import Img7 from "../../assets/images/07.jpeg";
import Img8 from "../../assets/images/08.jpeg";
import Img9 from "../../assets/images/09.jpeg";
import Img10 from "../../assets/images/10.jpeg";
import Img11 from "../../assets/images/11.jpeg";
import Img12 from "../../assets/images/12.jpeg";
import Img13 from "../../assets/images/13.jpeg";
import Img14 from "../../assets/images/14.jpeg";
import Img15 from "../../assets/images/15.jpeg";
import Img16 from "../../assets/images/16.jpeg";
import Img17 from "../../assets/images/17.jpeg";
import Img18 from "../../assets/images/18.jpeg";
import Img19 from "../../assets/images/19.jpeg";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Carousel = () => {
    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        cssEase: "linear"
    };

    return (
        <Slider arrows={false} {...settings} className={styles.carouselContainer}>
            <Image className={styles.carouselImage} src={Img1} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img2} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img3} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img4} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img5} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img6} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img7} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img8} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img9} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img10} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img11} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img12} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img13} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img14} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img15} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img16} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img17} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img18} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img19} alt="Image 1" />

        </Slider>
    );
};

export default Carousel;