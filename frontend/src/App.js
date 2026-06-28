import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "@/context/ThemeContext";
import { BookingProvider } from "@/context/BookingContext";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollPill from "@/components/ScrollPill";
import Cursor from "@/components/Cursor";
import NetworkScene from "@/three/NetworkScene";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { PAGE_TRANSITION } from "@/lib/motion";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Work from "@/pages/Work";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Resources from "@/pages/Resources";
import ResourceWorkbooks from "@/pages/ResourceWorkbooks";
import ResourceWorkflows from "@/pages/ResourceWorkflows";
import ResourceEbooks from "@/pages/ResourceEbooks";

function scrollTop() {
  if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
  else window.scrollTo({ top: 0, behavior: "instant" });
}

// The full-viewport network backdrop only lives on the Home page. Inner pages
// render their own network confined to the hero (see PageHero).
function HomeBackground() {
  const { pathname } = useLocation();
  if (pathname !== "/") return null;
  return <NetworkScene />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" onExitComplete={scrollTop}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={PAGE_TRANSITION}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/work" element={<Work />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/workbooks" element={<ResourceWorkbooks />} />
          <Route path="/resources/workflow-automations" element={<ResourceWorkflows />} />
          <Route path="/resources/ebooks" element={<ResourceEbooks />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <SmoothScroll />
        <ScrollPill />
        <Cursor />
        <BrowserRouter>
          <HomeBackground />
          <div className="relative z-10 text-weha-text">
            <Header />
            <AnimatedRoutes />
            <Footer />
          </div>
          <FloatingWhatsApp />
          <Toaster position="bottom-right" />
        </BrowserRouter>
      </BookingProvider>
    </ThemeProvider>
  );
}

export default App;
