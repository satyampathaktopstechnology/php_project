import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ChevronDown } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch {
      alert('Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How does the Razorpay checkout process work?',
      a: 'When you select Razorpay at checkout, our secure gateway initiates in real-time. You can complete payments via UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, or choose Cash on Delivery (COD). Every transaction is verified via cryptographic signature.'
    },
    {
      q: 'What is your return & exchange window?',
      a: 'Essence provides a 30-day hassle-free return and exchange guarantee on unworn, unwashed items with original designer tags intact.'
    },
    {
      q: 'How do I track my order delivery?',
      a: 'Log into your customer account and navigate to "My Orders" to inspect the live status progression from Order Placed to Dispatched and Delivered.'
    },
    {
      q: 'Are your fabrics authentically certified and eco-conscious?',
      a: 'Yes, our ateliers partner with verified mills in Portugal and India adhering to GOTS certified organic cottons, French flax linens, and ethical dyes.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn space-y-16">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-rose-600">Client Concierge</span>
        <h1 className="text-3xl md:text-4xl font-black font-serif text-neutral-900">Get In Touch</h1>
        <p className="text-xs text-neutral-500">
          Have an inquiry regarding bespoke fitting, shipping, or returns? Our styling specialists are here to assist.
        </p>
      </div>

      {/* Grid: Contact Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Info Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
            <h3 className="text-xl font-bold font-serif">Flagship Showrooms</h3>

            <div className="space-y-5 text-xs text-neutral-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Essence Studio Flagship</h4>
                  <p className="mt-0.5">Plot 14, Linking Road, Bandra West, Mumbai, MH 400050</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Direct Phone Line</h4>
                  <p className="mt-0.5">+91 (022) 4987-6543 / +91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Concierge Email</h4>
                  <p className="mt-0.5">concierge@essence-fashion.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-sm">Operating Hours</h4>
                  <p className="mt-0.5">Monday &ndash; Saturday: 10:00 AM &ndash; 8:00 PM IST</p>
                  <p>Sunday: 11:00 AM &ndash; 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-neutral-100 shadow-xs space-y-6">
          <div>
            <h3 className="text-xl font-bold font-serif text-neutral-900">Send an Inquiry</h3>
            <p className="text-xs text-neutral-500 mt-1">Our customer concierge typically replies within 2 business hours.</p>
          </div>

          {successMsg && (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Jessica Taylor"
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Inquiry Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Product Sizing, Custom Orders, Order Delivery..."
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Your Message *</label>
              <textarea
                required
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Please share your questions or styling requests..."
                className="w-full p-3 border border-neutral-300 rounded-xl focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-neutral-900 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <section className="max-w-3xl mx-auto pt-6 space-y-4">
        <h3 className="text-xl font-bold font-serif text-neutral-900 text-center mb-6">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-4 text-left text-xs font-bold text-neutral-800 flex justify-between items-center hover:bg-neutral-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === i ? 'rotate-180 text-rose-600' : 'text-neutral-400'}`} />
              </button>
              {openFaq === i && (
                <div className="p-4 pt-0 text-xs text-neutral-600 leading-relaxed border-t border-neutral-100 bg-neutral-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
