import React from 'react'
import styles from './OurClient.module.css'
import Image from 'next/image'
import Abb from '../../assets/logo/abb.svg';
import Akg from '../../assets/logo/Akg.jpg';
import Bec from '../../assets/logo/Bec.jpg';
import Finolex from '../../assets/logo/Finolex.svg';
import Hager from '../../assets/logo/Hager.svg';
import Havells from '../../assets/logo/Havells.svg';
import Kei from '../../assets/logo/Kei.png';
import Legrand from '../../assets/logo/legrand.svg';
import Philips from '../../assets/logo/philips.svg';
import Polypack from '../../assets/logo/polypack.png';
import Schneider from '../../assets/logo/schneider.svg';
import Wipro from '../../assets/logo/wipro.jpg';
const OurClient = () => {
    return (
        <section id='our-client' className={styles.OurClient}>
            <div className={styles.head}>Our Client</div>
            <div className={styles.container}>
                <Image width={100} src={Abb} alt="Image 1" />
                <Image width={100} src={Akg} alt="Image 1" />
                <Image width={100} src={Bec} alt="Image 1" />
                <Image width={100} src={Finolex} alt="Image 1" />
                <Image width={100} src={Hager} alt="Image 1" />
                <Image width={100} src={Havells} alt="Image 1" />
                <Image width={100} src={Kei} alt="Image 1" />
                <Image width={100} src={Legrand} alt="Image 1" />
                <Image width={100} src={Philips} alt="Image 1" />
                <Image width={100} src={Polypack} alt="Image 1" />
                <Image width={100} src={Schneider} alt="Image 1" />
                <Image width={100} src={Wipro} alt="Image 1" />

            </div>

        </section>
    )
}

export default OurClient