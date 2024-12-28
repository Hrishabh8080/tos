"use client";
import React, { useState, useEffect } from "react";
import styles from "./Carousel.module.css"; // Import the CSS module

import Img1 from "../../assets/images/01.jpeg";
import Img2 from "../../assets/images/02.jpeg";
import Img3 from "../../assets/images/03.jpeg";  
import Img4 from "../../assets/images/04.jpeg";
import Img5 from "../../assets/images/05.jpeg";
import Img6 from "../../assets/images/06.jpg";
import Img7 from "../../assets/images/07.jpg";
import Img8 from "../../assets/images/08.jpg";
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
            <Image className={styles.carouselImage} src={Img8} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img7} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img6} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img1} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img2} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img3} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img4} alt="Image 1" />
            <Image className={styles.carouselImage} src={Img5} alt="Image 1" />
        </Slider>
    );
};

export default Carousel;