"use client";
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import styles from './Testimonial.module.css';
import User1 from '../../assets/images/user1.jpeg';
import User2 from '../../assets/images/user2.jpeg';
import User3 from '../../assets/images/user3.jpg';

const testimonialsData = [
  {
    name: 'Aarav Sharma',
    location: 'New Delhi, IN',
    testimonial:
      "I had an amazing experience with this service! The team was professional, and the results exceeded my expectations. I highly recommend them to anyone looking for top-notch solutions. The process was seamless, and I felt supported every step of the way!",
    rating: 5,
    imageUrl: User1,
  },
  {
    name: 'Priya Verma',
    location: 'Gurugram, IN',
    testimonial:
      'Fantastic experience! The team was always responsive, and they really understood my needs. Highly recommend them!',
    rating: 5,
    imageUrl: User3,
  },
  {
    name: 'Rohan Mehta',
    location: 'Noida, IN',
    testimonial:
      'This company helped me achieve my goals in a timely and efficient manner. The staff is always available for support, and the results speak for themselves.',
    rating: 5,
    imageUrl: User2,
  }
];

// Testimonial Card Component
const TestimonialCard = ({ name, location, testimonial, rating, imageUrl }) => {
  return (
    <div className={styles.testimonialCard}>
      <div className={styles.testimonialImage}>
        <Image
          className={styles.testimonialImageImg}
          src={imageUrl || 'https://via.placeholder.com/100'}
          alt={`${name}'s photo`}
        />
      </div>
      <div className={styles.testimonialContent}>
        <h3 className={styles.customerName}>{name}</h3>
        <p className={styles.customerLocation}>{location}</p>
        <p className={styles.testimonialText}>{testimonial}</p>
        <div className={styles.testimonialRating}>
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              className={`${styles.star} ${index < rating ? styles.filled : ''}`}
            >
              &#9733;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// App Component to display the Testimonials
const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    setTestimonials(testimonialsData);
  }, []);

  return (
    <div id="testimonial" className={styles.Testimonial}>
      <div className={styles.head}>
        Customer Testimonials
      </div>
      <div className={styles.testimonialContainer}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            name={testimonial.name}
            location={testimonial.location}
            testimonial={testimonial.testimonial}
            rating={testimonial.rating}
            imageUrl={testimonial.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default Testimonial;
