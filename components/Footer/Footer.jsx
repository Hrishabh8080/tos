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
                <>
                    <p className={CSS.content}>
                        <b>Email: </b>
                        <a href="mailto:support@toselectricals.com">support@toselectricals.com</a>
                    </p>
                    <p className={CSS.content}>
                        <b>Phone: </b>
                        <a href="tel:+919911491624">+91-9911491624</a>,
                        <a href="tel:+919990901524">+91-9990901524</a>
                    </p>
                    <p className={CSS.content}>
                        <b>Address: </b> Office No. 2, Ashok Vihar Phase II, Near Shiv Shakti Mandir, Gurgaon, Haryana, India
                    </p>
                </>
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
                <p>© 2025 TOTAL OFFICE SOLUTIONS. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
