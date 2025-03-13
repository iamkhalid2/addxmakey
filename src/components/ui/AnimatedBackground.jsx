import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const AnimatedBackground = () => {
  const bgRef = useRef(null);
  
  useEffect(() => {
    if (!bgRef.current) return;
    
    // Create gradient animation
    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      duration: 15
    });
    
    // Animate the gradients in a slow, subtle way
    tl.to(bgRef.current, {
      backgroundPosition: '200% 50%',
      duration: 20,
      ease: "sine.inOut"
    });
    
    return () => {
      tl.kill();
    };
  }, []);
  
  return (
    <div className="fixed inset-0 w-full h-full -z-10 opacity-30">
      <div 
        ref={bgRef}
        className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-secondary-50/10 to-accent-50/20"
        style={{
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 50%',
        }}
      />
      
      {/* Abstract shapes */}
      <div className="absolute top-20 right-[20%] w-72 h-72 rounded-full bg-primary-400/10 blur-3xl" />
      <div className="absolute bottom-40 left-[15%] w-64 h-64 rounded-full bg-accent-400/10 blur-3xl" />
      <div className="absolute top-1/4 left-[30%] w-96 h-96 rounded-full bg-secondary-300/5 blur-3xl" />
      
      {/* Mesh gradient */}
      <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAwIiBoZWlnaHQ9IjIwMDAiPgogIDxmaWx0ZXIgaWQ9Im5vaXNlIiB4PSIwIiB5PSIwIj4KICAgIDxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjY1IiBudW1PY3RhdmVzPSIzIiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+CiAgICA8ZmVCbGVuZCBtb2RlPSJzY3JlZW4iLz4KICA8L2ZpbHRlcj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')]" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBzdHJva2U9InJnYmEoMCwwLDAsMC4wMykiIGQ9Ik0wIC41aDE5Ljk5OTk5OTk5OTk5OTk5OCIvPjxwYXRoIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgZD0iTTAgeDE5LjVoMTkuOTk5OTk5OTk5OTk5OTk4Ii8+PHBhdGggc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDMpIiBkPSJNLjUgMHYxOS45OTk5OTk5OTk5OTk5OTgiLz48cGF0aCBzdHJva2U9InJnYmEoMCwwLDAsMC4wMykiIGQ9Ik0xOS41IDB2MTkuOTk5OTk5OTk5OTk5OTk4Ii8+PC9nPjwvc3ZnPg==')]" />
    </div>
  );
};

export default AnimatedBackground;