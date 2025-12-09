import React from 'react'
import CSS from './About.module.css'

const About = () => {
    return (
        <section id='about' className={CSS.About}>
            <div className={CSS.container}>
                <div className={CSS.head}>
                    <h2>About Us</h2>
                    <div className={CSS.underline}></div>
                </div>
                
                <div className={CSS.contentWrapper}>
                    <div className={CSS.introCard}>
                        <div className={CSS.yearBadge}>
                            <span className={CSS.year}>Since 2017</span>
                        </div>
                        <p className={CSS.intro}>
                            <strong>TOTAL OFFICE SOLUTIONS</strong> has become a leading supplier of high-quality electronic and electrical products, specializing in bulk distribution to vendors, contractors, and businesses across various industries. With years of experience, we are committed to providing reliable and cost-effective solutions tailored to meet the specific needs of our clients.
                        </p>
                    </div>

                    <div className={CSS.features}>
                        <div className={CSS.featureCard}>
                            <div className={CSS.icon}>📦</div>
                            <h3>Wide Product Range</h3>
                            <p>Comprehensive selection of electrical wires & cables, conduits, distribution boards, MCBs, RCCBs, isolators, MCCBs, switches & sockets, and innovative LED lighting solutions.</p>
                        </div>
                        
                        <div className={CSS.featureCard}>
                            <div className={CSS.icon}>✓</div>
                            <h3>Quality Assurance</h3>
                            <p>All products are rigorously tested for performance, durability, and safety. We source only the best materials to ensure reliability of electrical systems.</p>
                        </div>
                        
                        <div className={CSS.featureCard}>
                            <div className={CSS.icon}>🚚</div>
                            <h3>Efficient Delivery</h3>
                            <p>Our efficient supply chain and project packing services ensure timely deliveries for both small projects and large-scale commercial needs.</p>
                        </div>
                    </div>

                    <div className={CSS.commitment}>
                        <p>At <strong>TOTAL OFFICE SOLUTIONS</strong>, quality and customer satisfaction are our top priorities. We are dedicated to providing exceptional service, making us the trusted partner for all your electrical product requirements.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default About