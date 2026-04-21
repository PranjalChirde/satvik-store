import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './Toast';
import {
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Heart,
} from "lucide-react";

const footerLinks = {
  shop: [
    { label: "Best Sellers", href: "/category/bestsellers" },
    { label: "New Arrivals", href: "/category/new-arrivals" },
    { label: "Jap Mala Collection", href: "/category/jap-malas" },
    { label: "Healing & Vastu", href: "/category/healing-gifts" },
    { label: "Daily Puja Essentials", href: "/category/puja-samagri" },
    { label: "Murti Sangrah", href: "/category/brass-idols" },
  ],
  company: [
    { label: "About Us", href: "/" },
    { label: "Our Story", href: "/" },
    { label: "Blog & Articles", href: "/" },
    { label: "Press & Media", href: "/" },
    { label: "Careers", href: "/" },
  ],
  support: [
    { label: "Shipping Policy", href: "/" },
    { label: "Returns & Exchanges", href: "/" },
    { label: "Privacy Policy", href: "/" },
    { label: "Terms of Service", href: "/" },
    { label: "Track Your Order", href: "/track-order" },
    { label: "FAQs", href: "/" },
  ],
};

const socials = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "#",
    color: "hover:text-pink-400",
  },
  {
    icon: Facebook,
    label: "Facebook",
    href: "#",
    color: "hover:text-blue-400",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "#",
    color: "hover:text-red-400",
  },
  {
    icon: Twitter,
    label: "Twitter",
    href: "#",
    color: "hover:text-sky-400",
  },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API call
    showToast(`Thanks for subscribing with ${email}!`, 'success');
    setEmail('');
  };

  return (
    <footer className="bg-[#111111] text-gray-400">
      {/* Top Banner Strip */}
      <div className="bg-orange-600 py-3 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-white text-sm">
          <span className="flex items-center gap-2">
            <span className="text-base">🕉️</span>
            Authenticity Guaranteed — Every product is ethically
            sourced &amp; handcrafted
          </span>
          <span className="flex items-center gap-2 opacity-90">
            <Phone className="w-3.5 h-3.5" />
            +91 98765 43210
          </span>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column — spans 2 */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white text-xl font-bold select-none">
                ॐ
              </div>
              <h3
                className="text-2xl text-white tracking-wide"
                style={{
                  fontFamily: "Playfair Display, serif",
                }}
              >
                Satvik Store
              </h3>
            </div>

            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              Your trusted destination for authentic spiritual
              &amp; traditional Indian products. Rooted in Vedic
              wisdom, crafted with devotion — bringing divinity
              to your doorstep since 2018.
            </p>

            {/* Contact */}
            <ul className="space-y-2.5 text-sm mb-7">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                <span>
                  No. 12, Thiruvanmiyur, Chennai – 600 041,
                  Tamil Nadu, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-orange-400 transition"
                >
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                <a
                  href="mailto:hello@satvikstore.in"
                  className="hover:text-orange-400 transition"
                >
                  hello@satvikstore.in
                </a>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {socials.map(
                ({ icon: Icon, label, href, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`w-9 h-9 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 transition ${color} hover:border-current`}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ),
              )}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-orange-500 inline-block"></span>
              Shop
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.shop.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-1.5 hover:text-orange-400 transition group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-orange-500 inline-block"></span>
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="flex items-center gap-1.5 hover:text-orange-400 transition group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Newsletter */}
          <div className="flex flex-col gap-8">
            <div>
              <h4 className="text-white text-sm tracking-widest uppercase mb-5 flex items-center gap-2">
                <span className="w-4 h-px bg-orange-500 inline-block"></span>
                Support
              </h4>
              <ul className="space-y-2.5 text-sm">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="flex items-center gap-1.5 hover:text-orange-400 transition group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
                <span className="w-4 h-px bg-orange-500 inline-block"></span>
                Newsletter
              </h4>
              <p className="text-xs mb-3 leading-relaxed">
                Get exclusive offers, spiritual insights &amp;
                new arrivals straight to your inbox.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                  required
                />
                <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white text-sm px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="my-10 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          <span className="text-orange-500 text-xl select-none">
            ॐ
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-xs text-gray-500">
            © 2026 Satvik Store. All rights reserved. Made with{" "}
            <Heart className="inline w-3 h-3 text-orange-500 fill-orange-500" />{" "}
            in India.
          </p>

          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              We Accept:
            </span>
            <div className="flex items-center gap-2">
              {[
                "UPI",
                "Visa",
                "Mastercard",
                "RuPay",
                "NetBanking",
              ].map((method) => (
                <span
                  key={method}
                  className="bg-white/10 border border-white/10 text-gray-300 text-[10px] px-2 py-1 rounded"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <Link
              to="/"
              className="hover:text-orange-400 transition"
            >
              Privacy
            </Link>
            <span className="text-gray-700">·</span>
            <Link
              to="/"
              className="hover:text-orange-400 transition"
            >
              Terms
            </Link>
            <span className="text-gray-700">·</span>
            <Link
              to="/"
              className="hover:text-orange-400 transition"
            >
              Sitemap
            </Link>
            <span className="text-gray-700">·</span>
            <Link
              to="/admin"
              className="hover:text-orange-400 transition"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}