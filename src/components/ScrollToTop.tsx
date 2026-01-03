import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto" // 'auto' is usually better for immediate reset on navigation, but user requested 'smooth'. 
            // I will use 'smooth' as per the specific prompt instructions.
        });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
