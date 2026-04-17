"use client";

import Header from "@/components/ui/nav";
import HeroBackground from "@/components/ui/hero";
import Slide from "@/components/ui/slide";
import TextSlide from "@/components/ui/textSlide";
import FeatureRecommand from "@/components/ui/featureRecommand"
import WorksCompo from "@/components/ui/works";
import Challenge from "@/components/ui/challenge";
import Footer from "@/components/ui/footer"
function Homepage() {
  return (
    <div className="min-h-screen bg-white scroll-smooth selection:bg-blue-600 selection:text-white">
      <Header />
      <HeroBackground />
      <TextSlide />
      <FeatureRecommand/>
      <WorksCompo/>
      <Challenge/>
      <Footer/>
    </div>
  );
}

export default Homepage;