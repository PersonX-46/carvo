// src/app/page.tsx
import NavBar from "../components/NavBar";
import HeroSection from "../components/HeroSection";
import Features from "../components/Features";
import Services from "@/components/Services";
import BookingSection from "@/components/BookingSection";
import Footer from "@/components/Footer";
import AIChat from "@/components/AiChat";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavBar />
      <AIChat />
      {/* <HeroSection />
      <Features />
      <Services />
      <Footer /> */}
    </div>
  );
}
