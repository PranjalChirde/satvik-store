import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const messages = [
  "🚚 Free Shipping on Orders Over ₹699!",
  "✨ Authenticity Guaranteed on All Traditional Products",
  "🎁 Special Gift Wrapping Available on Checkout"
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-orange-600 text-white py-2.5 text-center text-sm font-medium relative overflow-hidden flex justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute"
        >
          {messages[currentIndex]}
        </motion.p>
      </AnimatePresence>
      {/* Invisible spacer to maintain height */}
      <p className="invisible">Spacer Text</p>
    </div>
  );
}
