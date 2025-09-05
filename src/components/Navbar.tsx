import { useState, useEffect, Children, cloneElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiAlertCircle, FiPhoneCall, FiBookOpen } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";
import { useRouter } from "next/navigation";

const NavItem = ({ children, className = "", onClick, isMobile }) => {
  const [isHovered, setIsHovered] = useState(false);
const router=useRouter();
  return (
    
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative flex items-center justify-center ${
        isMobile ? "w-10 h-10" : "w-14 h-14"
      } focus:outline-none transition-all duration-200 ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) =>
        cloneElement(child, { isHovered, isMobile })
      )}
    </div>
  );
};

const NavIcon = ({ children, className = "", isHovered = false }) => {
  const router=useRouter();
  return (
    <div
      className={`flex items-center justify-center transition-all duration-200 ${className}`}
    >
      <div
      onClick={()=>router.push('/onboarding')}
        className={`text-white transition-all duration-200  ${
          isHovered ? "scale-110 text-gray-300" : "text-white"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const Navbar = ({
  items = [
    { icon: <FiHome size={24} />, label: "Home", onClick: () => alert("Home!") },
    { icon: <FiAlertCircle size={24} />, label: "Info", onClick: () => alert("Info!") },
    { icon: <FiPhoneCall size={24} />, label: "Contact", onClick: () => alert("Contact!") },
    { icon: <FiBookOpen size={24} />, label: "Guide", onClick: () => alert("Guide!") },
  ],
  className = "",
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isVisible, setIsVisible] = useState(false);
  const [menuTopPosition, setMenuTopPosition] = useState("50%");
  const [landingComplete, setLandingComplete] = useState(false);


  // ✅ Handle scroll + landing state
  useEffect(() => {
    const checkAndShowNavbar = () => {
      if (window.scrollY > 0 || landingComplete) {
        setIsVisible(true);
      }
    };

    checkAndShowNavbar();
    const timer = setTimeout(checkAndShowNavbar, 3000);

    window.addEventListener("scroll", checkAndShowNavbar);

    const handleLandingComplete = () => {
      setTimeout(() => setLandingComplete(true), 100);
    };

    if (document.body.classList.contains("landing-complete")) {
      setLandingComplete(true);
    }

    window.addEventListener("landingAnimationComplete", handleLandingComplete);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkAndShowNavbar);
      window.removeEventListener("landingAnimationComplete", handleLandingComplete);
    };
  }, [landingComplete]);

  // ✅ Calculate nav position next to hero heading (desktop only)
  useEffect(() => {
    const calculateMenuPosition = () => {
      const heading = document.getElementById("hero-heading");
      if (heading && !isMobile) {
        const headingRect = heading.getBoundingClientRect();
        const headingCenter = headingRect.top + headingRect.height / 2;
        const adjustedPosition = headingCenter - 89;
        setMenuTopPosition(`${adjustedPosition}px`);
      }
    };

    calculateMenuPosition();
    window.addEventListener("resize", calculateMenuPosition);
    const timeoutId = setTimeout(calculateMenuPosition, 100);

    return () => {
      window.removeEventListener("resize", calculateMenuPosition);
      clearTimeout(timeoutId);
    };
  }, [isMobile, isVisible]);

  return (
    // ✅ Always-mounted wrapper
    <div className="fixed top-0 left-0 w-full pointer-events-none z-[9999]">
      {/* <AnimatePresence>
        {(isVisible || landingComplete) && (
          <motion.div
            key="navbar"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute ${
              isMobile
                ? "bottom-4 left-1/2 transform -translate-x-1/2 max-w-[85vw]"
                : "left-4"
            }`}
            style={{
              top: isMobile ? undefined : menuTopPosition,
              transform: isMobile ? "translateX(-50%)" : "translateY(-50%)",
            }}
          >
            <div
              className={`flex ${
                isMobile ? "flex-row space-x-1" : "flex-col space-y-2"
              } items-center ${
                isMobile ? "py-4 px-1" : "py-8 px-2"
              } ${className}`}
              role="toolbar"
              aria-label="Application navigation"
              style={{
                backgroundColor: "#313131",
                border: "none",
                borderRadius: "50px",
                boxShadow: "-5px 5px 4px 0px rgba(0,0,0,0.4)",
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`${
                    isMobile
                      ? index !== items.length - 1
                        ? "border-r border-gray-600"
                        : ""
                      : index !== items.length - 1
                      ? "border-b border-gray-600"
                      : ""
                  }`}
                >
                  <NavItem 
                    onClick={item.onClick} 
                    isMobile={isMobile}
                  >
                    <NavIcon>{item.icon}</NavIcon>
                  </NavItem>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default Navbar;
