import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(false);
  const [isShrinked, setIsShrinked] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (window.innerWidth < 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
      if (window.innerWidth > 1400) {
        setIsWideScreen(true);
      } else {
        setIsWideScreen(false);
      }
      if (window.innerWidth < 350 || window.innerHeight < 450) {
        setIsShrinked(true);
      } else {
        setIsShrinked(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { windowSize, isMobile, isWideScreen, isShrinked };
};

export default useWindowSize;
