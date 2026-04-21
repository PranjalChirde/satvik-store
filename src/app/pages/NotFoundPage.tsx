import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center bg-[#FAF8F5]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto relative z-10"
      >
        <div className="relative mb-6">
          <h1 className="text-[12rem] font-bold text-orange-600/5 leading-none select-none" style={{ fontFamily: 'Playfair Display, serif' }}>
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center flex-col top-10">
            <h2 className="text-4xl font-semibold text-gray-900 mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Path Not Found
            </h2>
            <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
          </div>
        </div>

        <p className="text-gray-600 mb-10 leading-relaxed text-lg px-6">
          The sacred page you are searching for has been moved or does not exist. Let us guide you back to the spiritual collection.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-3.5 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
      
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-400/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
}
