"use client";

import React, { useState, useEffect } from "react";
import styles from "./ContactForm.module.css";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        email: "",
        company: "",
        message: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        mobile: "",
        message: "",
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);  // New state for loading

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Validate Name
        if (!formData.name) {
            newErrors.name = "Full name is required.";
        }

        // Validate Mobile
        const mobileRegex = /^[0-9]{10}$/;
        if (formData.mobile && !mobileRegex.test(formData.mobile)) {
            newErrors.mobile = "Please enter a valid 10-digit mobile number.";
        }

        // Validate Message
        if (!formData.message) {
            newErrors.message = "Message is required.";
        }

        setErrors(newErrors);

        // Check if all required fields are valid
        setIsFormValid(
            formData.name &&
            formData.mobile &&
            formData.message &&
            !newErrors.name &&
            !newErrors.mobile &&
            !newErrors.message
        );
    };

    useEffect(() => {
        validateForm();
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);  // Show the loader when form is submitting

        const formattedTime = formatDateTime(new Date());

        const formDataObj = { ...formData, time: formattedTime };

        try {
            const googleSheetsUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbyWQy8Mx5827qmSsA5bHpzQgAKWG09Z1gnfe1QV2uALFpPpY83xttfogmTg-oGhGYC3/exec";
            const response = await fetch(googleSheetsUrl,
                {
                    method: "POST",
                    body: new URLSearchParams(formDataObj),
                }
            );

            if (response.ok) {
                alert("Data submitted successfully! We will contact you within 24 to 48 hours.");
                setFormData({
                    name: "",
                    mobile: "",
                    email: "",
                    company: "",
                    message: "",
                });
            } else {
                alert("Failed to submit the form");
            }
        } catch (error) {
            alert("There was an error submitting the form.");
        } finally {
            setIsLoading(false);  // Hide the loader after submission is complete
        }
    };

    // Helper function to format date as 'yyyy-mm-dd HH:MM:SS'
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
                    {errors.name && <span className={styles.error}>{errors.name}</span>}
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
                    {errors.message && <span className={styles.error}>{errors.message}</span>}
                </div>

                <button
                    type="submit"
                    className={`${styles.submitButton}   ${!isFormValid || isLoading ? styles.disabled : ""}`}
                    disabled={!isFormValid || isLoading}
                >
                    Submit
                    {isLoading ? (
                        <div className={styles.loader}></div>
                    ) : ""}
                </button>
            </form>
        </section>
    );
};

export default ContactForm;
