import React from 'react'
// Distributed
import styles from './OurClient.module.css'
import Image from 'next/image'
import Abb from '../../assets/logo/abb.svg';
import Akg from '../../assets/logo/Akg.jpg';
import Hager from '../../assets/logo/Hager.svg';
import Kei from '../../assets/logo/Kei.png';
import Legrand from '../../assets/logo/legrand.svg';
import Polypack from '../../assets/logo/polypack.png';
import Schneider from '../../assets/logo/schneider.svg';
import Philips from '../../assets/logo/philips.svg';
import Havells from '../../assets/logo/Havells.svg';
// Client
import Godrage from '../../assets/logo/Godrage.png';
import Emmar from '../../assets/logo/Emmar.png';
import Ireo from '../../assets/logo/Ireo.png';
import M3m from '../../assets/logo/M3m.png';
import Spotlight from '../../assets/logo/Spotlight.png';
import Aiims from '../../assets/logo/Aiims.png';
import Maruti from '../../assets/logo/Maruti.png';
import Honda from '../../assets/logo/Honda.png';


const distributorImages = [
    { src: Kei, alt: 'Kei' },
    { src: Akg, alt: 'Akg' },
    { src: Legrand, alt: 'Legrand' },
    { src: Hager, alt: 'Hager' },
    { src: Schneider, alt: 'Schneider' },
    { src: Abb, alt: 'Abb' },
    { src: Polypack, alt: 'Polypack' },
    { src: Philips, alt: 'Philips' },
    { src: Havells, alt: 'Havells' },


];

const clientImages = [
    { src: Godrage, alt: 'Godrage' },
    { src: Emmar, alt: 'Emmar' },
    { src: Ireo, alt: 'Ireo' },
    { src: M3m, alt: 'M3m' },
    { src: Spotlight, alt: 'Spotlight' },
    { src: Aiims, alt: 'Aiims' },
    { src: Maruti, alt: 'Maruti' },
    { src: Honda, alt: 'Honda' },
];
const OurClient = ({ type }) => {
    // type = 1 for Distributor and 2 for client
    const imagesToShow = type === 1 ? distributorImages : clientImages;

    return (
        <section id="our-client" className={styles.OurClient}>
            <div className={styles.head}>
                {type === 1 ? 'Our Distributors' : 'Our Clients'}
            </div>
            <div className={styles.container}>
                {imagesToShow.map((image, index) => (
                    <Image
                        key={index}
                        width={120}
                        src={image.src}
                        alt={image.alt}
                    />
                ))}
            </div>
        </section>
    );
};


export default OurClient