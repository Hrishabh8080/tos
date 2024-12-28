import React from 'react'
import CSS from './About.module.css'

const About = () => {
    return (
        <section id='about' className={CSS.About}>
            <div className={CSS.head}>About Us</div>
            <div className={CSS.content}>
                Founded in 2013, TOS has become a leading supplier of high-quality electronic and electrical products, specializing in bulk distribution to vendors, contractors, and businesses across various industries. With years of experience, we are committed to providing reliable and cost-effective solutions tailored to meet the specific needs of our clients.
                <br />
                We offer a comprehensive range of products, including electrical wires & cables, conduits, distribution boards, MCBs, RCCBs, isolators, and MCCBs, ensuring the safety and reliability of electrical systems. Our extensive catalog also features switches & sockets, modular plates & boxes, and innovative LED lighting solutions such as LED panels, bulbs, strips, and floodlights.
                <br />
                At TOS, quality and customer satisfaction are our top priorities. We source only the best materials, and all our products are rigorously tested for performance, durability, and safety. Our efficient supply chain and project packing services ensure timely deliveries, whether for small projects or large-scale commercial needs. We are dedicated to providing exceptional service, making us the trusted partner for all your electrical product requirements.
            </div>
        </section>
    )
}

export default About