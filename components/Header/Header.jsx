"use client"
import Link from "next/link";
import CSS from "./HeaderStyle.module.css";
import { useState } from "react";

const Header = () => {
    const [activeNav, setActiveNav] = useState('Home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '#about' },
        { name: 'Why Choose Us', path: '#why-choose-us' },
        // { name: 'Our Client', path: '#our-client' },
        { name: 'Testimonial', path: '#testimonial' },
        { name: 'Contact', path: '#contact-us' }
    ];

    const handleNavClick = (navItem) => {
        setActiveNav(navItem);
        setIsMobileMenuOpen(false);
        setTimeout(() => {
            window.scrollBy(0, -100);
        }, 800);

    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className={CSS.header}>
            <div className={CSS.left}>
                <h1 className={CSS.title}>Total Office Solutions</h1>
            </div>
            <nav className={CSS.right}>
                {/* Mobile Menu */}
                <ul className={`${CSS.navList} ${isMobileMenuOpen ? CSS.activeMenu : ''}`}>
                    {navItems.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.path}
                                className={`${CSS.navItem} ${activeNav === item.name && CSS.active}`}
                                onClick={() => handleNavClick(item.name)}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
                {/* Hamburger Icon */}
                <div className={CSS.hamburger} onClick={toggleMobileMenu}>
                    <div className={CSS.hamburgerLine}></div>
                    <div className={CSS.hamburgerLine}></div>
                    <div className={CSS.hamburgerLine}></div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
