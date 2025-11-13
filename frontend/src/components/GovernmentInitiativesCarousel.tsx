// src/components/GovernmentInitiativesCarousel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './GovernmentInitiativesCarousel.css';

interface Initiative {
  href: string;
  src: string;
  alt: string;
  title: string;
  external?: boolean;
}

const GovernmentInitiativesCarousel: React.FC = () => {
  // Government Initiatives with real images
  const initiatives: Initiative[] = [
    {
      href: "https://pmnrf.gov.in/en/",
      src: "/images/img1.png",
      alt: "Prime Minister's National Relief Fund",
      title: "Prime Minister's National Relief Fund",
      external: true
    },
    {
      href: "https://www.makeinindia.com/",
      src: "/images/img2.png",
      alt: "Make in India Initiative",
      title: "Make in India",
      external: true
    },
    {
      href: "https://www.nikshay.in/",
      src: "/images/img3.png",
      alt: "Nikshay - TB Patient Support",
      title: "Nikshay TB Support",
      external: true
    },
    {
      href: "https://mohfw.gov.in/major-programmes/poor-patients-financial-support",
      src: "/images/img4.png",
      alt: "Financial Support for Poor Patients",
      title: "Financial Aid Scheme",
      external: true
    },
    {
      href: "https://www.data.gov.in/",
      src: "/images/img5.jpg",
      alt: "Open Government Data Platform",
      title: "Open Data Platform",
      external: true
    },
    {
      href: "https://www.incredibleindia.gov.in/en",
      src: "/images/img6.png",
      alt: "Incredible India Campaign",
      title: "Incredible India",
      external: true
    },
    {
      href: "https://www.mygov.in/",
      src: "/images/img7.png",
      alt: "MyGov Citizen Engagement Platform",
      title: "MyGov Platform",
      external: true
    },
    {
      href: "https://mohfw.gov.in/right-information-rti/rti-act-for-ministry",
      src: "/images/img8.png",
      alt: "Ministry of Health Online Services",
      title: "Health Ministry Services",
      external: true
    },
    {
      href: "https://www.digitalindia.gov.in/",
      src: "/images/img9.png",
      alt: "Digital India Initiative",
      title: "Digital India",
      external: true
    },
    {
      href: "https://goidirectory.gov.in/",
      src: "/images/img10.png",
      alt: "Government of India Directory",
      title: "GOI Directory",
      external: true
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [itemsPerView, setItemsPerView] = useState(6);

  useEffect(() => {
    const updateItemsPerView = () => {
      const width = window.innerWidth;
      if (width <= 576) {
        setItemsPerView(2);
      } else if (width <= 992) {
        setItemsPerView(4);
      } else {
        setItemsPerView(6);
      }
    };
    updateItemsPerView();
    window.addEventListener('resize', updateItemsPerView);
    return () => window.removeEventListener('resize', updateItemsPerView);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prevIndex => {
      const maxStartIndex = Math.max(initiatives.length - itemsPerView, 0);
      return prevIndex >= maxStartIndex ? 0 : prevIndex + 1;
    });
  }, [initiatives.length, itemsPerView]);

  const prevSlide = () => {
    setCurrentIndex(prevIndex => {
      const maxStartIndex = Math.max(initiatives.length - itemsPerView, 0);
      return prevIndex === 0 ? maxStartIndex : prevIndex - 1;
    });
  };

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(nextSlide, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  return (
    <div className="government-initiatives-carousel">
      <h2 className="standard-heading text-heading">Government Initiatives</h2>
      
      <div className="carousel-container">
        <div className="playpause">
          <button 
            onClick={togglePlay} 
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <i className={`fa ${isPlaying ? 'fa-pause' : 'fa-play'}`} aria-hidden="true"></i>
          </button>
        </div>
        
        <div className="carousel-wrapper">
          <div 
            className="carousel-content"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
          >
            {initiatives.map((initiative, index) => (
              <div 
                key={index} 
                className="carousel-item"
                style={{ flex: `0 0 ${100 / itemsPerView}%` }}
              >
                <a 
                  href={initiative.href} 
                  target={initiative.external ? "_blank" : "_self"} 
                  rel={initiative.external ? "noopener noreferrer" : ""}
                  aria-label={`Opens ${initiative.external ? 'external website' : 'link'} - ${initiative.title}`}
                >
                  <img 
                    src={initiative.src} 
                    alt={initiative.alt} 
                    title={initiative.title}
                    className="carousel-image standard-image"
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          className="carousel-control prev" 
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <i className="fa fa-chevron-left"></i>
        </button>
        
        <button 
          className="carousel-control next" 
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <i className="fa fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="carousel-dots">
        {Array.from({ length: Math.max(initiatives.length - itemsPerView + 1, 1) }).map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default GovernmentInitiativesCarousel;