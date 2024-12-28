"use client"
import CSS from './FooterStyle.module.css';

const footerSections = [
    {
        title: "About Us",
        content: <p className={CSS.content}>We provide electronic items in bulk to various vendors and companies. We ensure high-quality products and services for all your needs.</p>
    },

    {
        title: "Contact",
        content: (
            <>
                <p className={CSS.content}>Email: totalofficesolutions85@gmail.com</p>
                <p className={CSS.content}>Phone: +91-9911491624, +91-9990901524</p>
                <p className={CSS.content}>Address: Office NO 2 ASHOK VIHAR PHASE II GURGAON</p>
            </>
        )
    },
];

const Footer = () => {
    return (
        <footer className={CSS.footer}>
            <div className={CSS.container}>
                {footerSections.map((section, index) => (
                    <div key={index} className={CSS.section}>
                        <h4 className={CSS.title}>{section.title}</h4>
                        {section.content}
                    </div>
                ))}
            </div>
            <div className={CSS.copyright}>
                <p>© 2024 TOS. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
