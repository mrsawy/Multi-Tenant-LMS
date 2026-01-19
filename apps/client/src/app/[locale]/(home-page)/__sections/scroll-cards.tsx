'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const ScrollCards = () => {
  const t = useTranslations('ScrollCards');
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const ticking = useRef(false);

  const cardsData = [
    {
      image: '/images/home-section-cards/card1/1.jpg',
      styles: { backgroundImage: "url('/images/home-section-cards/card1/bg.jpg')" },
      tag: t('cards.0.tag'), title: t('cards.0.title'), description: t('cards.0.description')
    },
    {
      image: '/images/home-section-cards/card2/5.jpg',
      styles: { backgroundImage: "url('/images/home-section-cards/card2/bg.jpg')" },
      tag: t('cards.1.tag'), title: t('cards.1.title'), description: t('cards.1.description')
    },
    {
      image: '/images/home-section-cards/card3/3.jpg',
      styles: { backgroundImage: "url('/images/home-section-cards/card3/bg.jpg')" },
      tag: t('cards.2.tag'), title: t('cards.2.title'), description: t('cards.2.description')
    },
    {
      image: '/images/home-section-cards/card4/6.jpg',
      styles: { backgroundImage: "url('/images/home-section-cards/card4/bg.jpg')" },
      tag: t('cards.3.tag'), title: t('cards.3.title'), description: t('cards.3.description')
    },
    {
      image: '/images/home-section-cards/card5/4.jpg',
      styles: { backgroundImage: "url('/images/home-section-cards/card5/bg.jpg')" },
      tag: t('cards.4.tag'), title: t('cards.4.title'), description: t('cards.4.description')
    },
    {
      image: '/images/home-section-cards/card6/2.jpg',
      styles: { backgroundImage: "url('/images/home-section-cards/card6/bg.jpg')" },
      tag: t('cards.5.tag'), title: t('cards.5.title'), description: t('cards.5.description')
    },
  ];

  // More responsive timing function with shorter duration
  const cardStyle = {
    height: '60vh',
    maxHeight: '600px',
    borderRadius: '32px',
    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform, opacity',
  };

  // Track viewport height for conditional styling
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    // Set initial height
    updateViewportHeight();

    // Listen for resize events
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  useEffect(() => {
    // Create intersection observer to detect when section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 } // Start observing when 10% of element is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Optimized scroll handler using requestAnimationFrame
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (!sectionRef.current) return;

          const sectionRect = sectionRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const totalScrollDistance = viewportHeight * 3.5;

          // Calculate the scroll progress
          let progress = 0;
          if (sectionRect.top <= 0) {
            progress = Math.min(1, Math.max(0, Math.abs(sectionRect.top) / totalScrollDistance));
          }

          // Determine which card should be visible based on progress
          const cardCount = cardsData.length;
          const step = 1 / cardCount;

          let newIndex = Math.floor(progress / step);
          if (newIndex >= cardCount) newIndex = cardCount - 1;

          setActiveCardIndex(newIndex);
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative" style={{ height: '450vh' }}>
      <section className="sticky top-0 h-screen w-full overflow-hidden py-10 md:py-16" id="why-safier">
        <div className="container mx-auto flex h-full flex-col px-6 lg:px-8">
          <div className="mb-2 md:mb-8">
            <div className="mb-4 flex items-center gap-4 pt-4 sm:pt-6 md:mb-4 md:pt-4">
              <div
                className="pulse-chip animate-fade-in opacity-0"
                style={{
                  animationDelay: '0.1s',
                }}>
                <span className="bg-primary/10 text-primary mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold">02</span>
                <span className="text-sm font-medium uppercase tracking-wider">{t('badge')}</span>
              </div>
            </div>

            <h2 className="section-title font-display text-primary mb-2 text-4xl font-bold sm:text-5xl md:mb-4 md:text-6xl">{t('title')}</h2>
          </div>

          <div ref={cardsContainerRef} className="perspective-1000 relative flex-1 mt-4 md:mt-8">
            {cardsData.map((card, index) => {
              const isVisible = isIntersecting && activeCardIndex >= index;

              // Calculate stack positions
              let translateY = '200px';
              let scale = 0.9;
              let opacity = 0;
              let zIndex = 10 * (index + 1);

              if (isVisible) {
                opacity = 1;
                // Active card logic
                if (activeCardIndex === index) {
                  translateY = `${20 + (cardsData.length - 1 - index) * 5}px`;
                  scale = 1;
                } else if (activeCardIndex > index) {
                  // Stacked cards logic
                  const diff = activeCardIndex - index;
                  translateY = `${20 + (cardsData.length - 1 - index) * 15 + diff * 12}px`;
                  scale = 1 - diff * 0.04;
                  opacity = 1 - diff * 0.15;
                }
              }

              return (
                <div
                  key={index}
                  className={`absolute inset-0 flex flex-col md:flex-row overflow-hidden border border-gray-100 shadow-2xl transition-all duration-700 ${isVisible ? 'animate-card-enter' : ''}`}
                  style={{
                    ...cardStyle,
                    zIndex,
                    transform: `translateY(${translateY}) scale(${scale})`,
                    opacity,
                    pointerEvents: activeCardIndex === index ? 'auto' : 'none',
                    ...card.styles
                  }}>
                  <div className='flex-1 h-1/2 md:h-full flex items-center justify-center p-6 md:p-12'>
                    <div className="relative w-full h-full">
                      <Image
                        className='rounded-2xl object-cover shadow-lg hover:scale-[1.02] transition-transform duration-500'
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </div>
                  <div className='flex-1 p-8 md:p-16 flex flex-col justify-center bg-white/40 backdrop-blur-sm'>
                    <div className="mb-4 inline-block">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        {card.tag}
                      </span>
                    </div>
                    <h3 className={cn(`text-base  sm:text-3xl md:text-5xl font-bold mb-6 text-gray-900 leading-[1.1] font-display`, viewportHeight >= 700 && 'text-2xl')}>
                      {card.title}
                    </h3>
                    <p className={cn(`text-gray-600 text-xs md:text-xl leading-relaxed max-w-lg`, viewportHeight >= 700 && 'text-lg')}>
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScrollCards;
