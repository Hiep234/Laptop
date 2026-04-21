import React, { useEffect } from "react";
import FeaturedCategories from "./FeaturedCategories";
import ProductSections from "./ProductSections";
import Features from "./Features";
import HeroSection from "./HeroSection";
import TestimonialsNewsletter from "./TestimonialsNewsletter";

const HomeScreen = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-screen-container">
      <HeroSection></HeroSection>
      <ProductSections></ProductSections>
      <TestimonialsNewsletter></TestimonialsNewsletter>
      <Features></Features>
    </div>
  );
};

export default HomeScreen;
