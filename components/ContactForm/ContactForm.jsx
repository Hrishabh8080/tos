"use client"

import React, { useState } from "react";
import styles from "./ContactForm.module.css";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        company: "",
        message: ""
    });

    const [errors, setErrors] = useState({
        mobile: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Form data collection
        const formElm = document.getElementById("SubmitResponce");
        const formData = new FormData(formElm);

        // Convert FormData to an object
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });

        // Mobile number validation
        const mobileRegex = /^[0-9]{10}$/;
        if (!mobileRegex.test(formDataObj.mobile)) {
            setErrors({ ...errors, mobile: "Please enter a valid 10-digit mobile number." });
            return;
        }

        const link = "";
        fetch(link, {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    console.log(response);
                    formElm.reset();
                    alert("Form submitted successfully!");
                    setFormData({
                        name: "",
                        mobile: "",
                        email: "",
                        company: "",
                        message: ""
                    });
                } else {
                    alert("Failed to submit the form");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("There was an error submitting the form.");
            });


    };

    return (
        <section id="contact-us" className={styles.contactFormContainer}>
            <h2 className={styles.title}>Contact Us</h2>
            <form id="SubmitResponce" onSubmit={handleSubmit} className={styles.contactForm}>
                <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>Full Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="mobile" className={styles.label}>Mobile Number</label>
                    <input
                        type="text"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                        maxLength="10"
                    />
                    {errors.mobile && <span className={styles.error}>{errors.mobile}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>Email (optional)</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="company" className={styles.label}>Company Name (optional)</label>
                    <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="message" className={styles.label}>Message</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        className={styles.textarea}
                        required
                    ></textarea>
                </div>

                <button type="submit" className={styles.submitButton}>Submit</button>
            </form>
        </section>
    );
};

export default ContactForm;
