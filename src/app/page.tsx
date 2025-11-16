// src/app/page.tsx
import NavBar from "./components/NavBar";
import HeroSection from "./components/HeroSection";
import Features from "./components/Features";
import Services from "@/app/components/Services";
import BookingSection from "@/app/components/BookingSection";
import Footer from "@/app/components/Footer";
import Login from "@/app/components/Login";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <NavBar />
      <HeroSection />
      <Features />
      <Services />
      <Footer />
    </div>
  );
}
