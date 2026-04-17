"use client";

import Header from "@/component/ui/nav";
import HeroBackground from "@/component/ui/hero";
import Slide from "@/component/ui/slide";
import TextSlide from "@/component/ui/textSlide";
import FeatureRecommand from "@/component/ui/featureRecommand"
import WorksCompo from "@/component/ui/works";
import Challenge from "@/component/ui/challenge";
import Footer from "@/component/ui/footer"
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