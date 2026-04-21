import { ShieldCheck, Truck, RefreshCw, Lock } from 'lucide-react';

const trustItems = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders above ₹699"
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Sourced directly, lab tested"
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "7-day hassle-free return policy"
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "SSL encrypted checkout"
  }
];

export function TrustBar() {
  return (
    <div className="bg-white border-y border-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-gray-50 transition duration-300 group"
            >
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-orange-100 transition-all duration-300">
                <item.icon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
