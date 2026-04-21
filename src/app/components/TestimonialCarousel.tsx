import React, { useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ananya Sharma",
    location: "Mumbai, India",
    rating: 5,
    text: "The brass peacock diya I ordered is absolutely stunning. The craftsmanship is exquisite, and it has brought such a divine glow to my puja room. Truly a premium piece.",
    initials: "AS"
  },
  {
    id: 2,
    name: "Rajesh Iyer",
    location: "Bangalore, India",
    rating: 5,
    text: "I was skeptical about ordering crystals online, but the healing crystals from Satvik are authentic and high-energy. I can feel the positive shift in my living room already.",
    initials: "RI"
  },
  {
    id: 3,
    name: "Priya Venkatesh",
    location: "Chennai, India",
    rating: 4,
    text: "My daily meditation practice has deepened since I started using the authentic Rudraksha mala. The quality is far superior to anything I've found in local markets.",
    initials: "PV"
  },
  {
    id: 4,
    name: "Vikram Mehta",
    location: "Delhi, India",
    rating: 5,
    text: "The Karungali bracelet arrived in beautiful packaging. It feels substantial and elegant. Excellent customer service and lightning-fast delivery to Delhi.",
    initials: "VM"
  },
  {
    id: 5,
    name: "Sowmya Reddy",
    location: "Hyderabad, India",
    rating: 5,
    text: "I purchased a set of Tulsi malas for my family. The scent is heavenly and you can tell they are genuine. Satvik Store is now my go-to for all spiritual essentials.",
    initials: "SR"
  }
];

export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="py-24 bg-[#FDFAF7] overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl text-gray-900 font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              What Our Seekers Say
            </h2>
            <div className="w-20 h-1 bg-orange-600 rounded-full mb-4"></div>
            <p className="text-gray-500 italic">
              "Joining thousands who have enhanced their spiritual journey with our authentic Satvik collections."
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={scrollPrev}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-orange-600 hover:border-orange-200 hover:shadow-lg transition-all duration-300 bg-white/50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={scrollNext}
              className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-white hover:text-orange-600 hover:border-orange-200 hover:shadow-lg transition-all duration-300 bg-white/50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="embla__slide flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pr-6">
                <div className="h-full bg-white/60 backdrop-blur-sm border border-white/80 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                  {/* Background Quote Icon Decoration */}
                  <Quote className="absolute -top-4 -right-4 w-24 h-24 text-orange-50/50 group-hover:text-orange-100/50 transition-colors duration-500 pointer-events-none" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < testimonial.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'}`} 
                      />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 relative z-10">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-100 to-orange-50 flex items-center justify-center text-orange-600 font-bold border border-white shadow-inner">
                      {testimonial.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-xs text-gray-400 uppercase tracking-widest">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
