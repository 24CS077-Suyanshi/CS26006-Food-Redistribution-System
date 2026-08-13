import React, { useEffect, useMemo, useRef, useState } from 'react';
import impactData from '../impactData.json';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Clock3,
  Facebook,
  HeartHandshake,
  Instagram,
  Leaf,
  Linkedin,
  Lock,
  Mail,
  MapPin,
  Phone,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Users
} from 'lucide-react';

const steps = [
  { title: 'Register', icon: Users, text: 'Create an account as a Donor, NGO, or Volunteer.' },
  { title: 'Donate Food', icon: Building2, text: 'Donors post details about their available surplus food.' },
  { title: 'NGO Requests Food', icon: HeartHandshake, text: 'Verified NGOs browse available donations and submit requests.' },
  { title: 'Volunteer Pickup', icon: Truck, text: 'Volunteers accept pickup tasks and collect food from donors.' },
  { title: 'Food Delivered', icon: Route, text: 'Food is safely delivered to the requesting NGO or community.' }
];

const features = [
  { title: 'Secure Login & Registration', icon: Lock, text: 'Protected authentication for donors, NGOs, and volunteers.' },
  { title: 'Role-Based Access', icon: ShieldCheck, text: 'Dedicated dashboards and permissions for Donors, NGOs, and Volunteers.' },
  { title: 'Food Donation Management', icon: Building2, text: 'Donors can post, manage, and track surplus food donations.' },
  { title: 'NGO Coordination', icon: HeartHandshake, text: 'Verified NGOs can browse donations and submit food requests.' },
  { title: 'Volunteer Support', icon: Truck, text: 'Volunteers can view and accept pickup and delivery tasks.' },
  { title: 'Feedback & Ratings', icon: Star, text: 'Build trust through feedback and ratings after successful food delivery.' },
  { title: 'Food Freshness Prediction', icon: Sparkles, text: 'Help assess the freshness or safe consumption window of donated food.' }
];

const impactStats = [
  { key: 'meals', label: 'Meals Shared', value: impactData.mealsShared, suffix: '+', icon: HeartHandshake },
  { key: 'ngos', label: 'Registered NGOs', value: impactData.registeredNGOs, suffix: '+', icon: Building2 },
  { key: 'volunteers', label: 'Active Volunteers', value: impactData.activeVolunteers, suffix: '+', icon: Users },
  { key: 'food', label: 'Food Saved', value: impactData.foodSavedKg, suffix: ' kg', icon: Leaf },
  { key: 'success', label: 'Successful Deliveries', value: impactData.successRate, suffix: '%', icon: ShieldCheck }
];

const chooseUs = [
  { title: 'Quick Donation Process', icon: Clock3, text: 'Share food listings quickly with a simple posting flow.' },
  { title: 'Trusted NGO Network', icon: HeartHandshake, text: 'Work with verified organizations and reliable partners.' },
  { title: 'Secure Platform', icon: Lock, text: 'Role-based controls and secure authentication for every user.' },
  { title: 'Eco-Friendly Solution', icon: Leaf, text: 'Prevent edible food from going to landfills and feed communities.' }
];

function SectionHeader({ kicker, title, subtitle, center = false, right = false, justify = false }) {
  const alignClass = center ? 'mx-auto text-center' : right ? 'ml-auto text-right' : '';
  const subtitleClass = `mt-4 text-slate-800 font-medium text-lg md:text-xl leading-relaxed ${justify ? 'text-justify' : ''}`;
  return (
    <div className={`max-w-4xl ${alignClass}`}>
      {kicker && (
        <span className="inline-flex rounded-full border border-emerald-300 bg-emerald-100/80 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-800">
          {kicker}
        </span>
      )}
      <h2 className="mt-3.5 text-3xl md:text-4xl font-black tracking-tight text-slate-900">{title}</h2>
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
    </div>
  );
}

function formatNumber(value) {
  return value.toLocaleString('en-IN');
}

export default function HomePage({ onOpenAuth }) {
  const impactRef = useRef(null);
  const [start, setStart] = useState(false);
  const [counts, setCounts] = useState(() =>
    impactStats.reduce((acc, item) => {
      acc[item.key] = 0;
      return acc;
    }, {})
  );

  useEffect(() => {
    const node = impactRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStart(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!start) return undefined;

    let frame;
    const startTime = performance.now();
    const duration = 1200;

    const run = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      setCounts(
        impactStats.reduce((acc, item) => {
          acc[item.key] = Math.floor(item.value * progress);
          return acc;
        }, {})
      );

      if (progress < 1) {
        frame = requestAnimationFrame(run);
      }
    };

    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [start]);

  return (
    <div id="home-section" className="bg-slate-50 text-slate-800">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-teal-300/20 blur-3xl"></div>
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 pb-20 pt-16 md:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24 lg:pb-28">

          {/* Left Column - Content */}
          <div className="flex flex-col justify-center relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 shadow-xs">
                <Sparkles size={12} className="text-emerald-500" />
                Zero Hunger Initiative
              </span>
            </div>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
              Rescue Food.<br />
              <span className="text-emerald-500">Feed Hope.</span><br />
              Build Community.
            </h1>

            <p className="mt-6 max-w-2xl text-lg font-medium text-slate-600 leading-relaxed md:text-xl">
              Empowering local businesses, organizations, households, and volunteers to redirect surplus food to communities in need. Reduce food waste, support people, and build a stronger community together.
            </p>




          </div>

          {/* Right Column - Live Impact Glass Card */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Dynamic abstract background shapes for glass effect */}
            <div className="absolute top-10 right-10 w-48 h-48 rounded-full bg-gradient-to-tr from-emerald-300 to-emerald-500 blur-3xl opacity-40 mix-blend-multiply animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-56 h-56 rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 blur-3xl opacity-40 mix-blend-multiply"></div>

            <div className="relative w-full rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-emerald-900/10 backdrop-blur-xl md:p-8">

              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Impact Tracker
                  </h3>
                  <p className="mt-1 text-slate-600 text-sm font-semibold">Real-time platform activity.</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 border border-slate-200 flex items-center justify-center text-emerald-600">
                  <BarChart3 size={18} />
                </div>
              </div>

              {/* Live Activity Feed */}
              <div className="flex flex-col gap-4">
                <div className="group flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 border border-blue-200">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">50kg Fresh Buffet Surplus</p>
                    <p className="text-xs font-semibold text-slate-500">Donated by <span className="text-slate-700 font-bold">Grand Plaza Hotel</span> • Just now</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 border border-purple-200">
                    <HeartHandshake size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Claimed & Scheduled</p>
                    <p className="text-xs font-semibold text-slate-500">By <span className="text-slate-700 font-bold">Hope Community Shelter</span> • 2m ago</p>
                  </div>
                </div>

                <div className="group flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 transition-all hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                    <Truck size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Successfully Delivered</p>
                    <p className="text-xs font-semibold text-slate-500">200 Meals to <span className="text-slate-700 font-bold">Downtown Area</span> • 15m ago</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 h-[1px] w-full bg-slate-200"></div>

              {/* System Stats Demo */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center relative group hover:border-slate-400 transition-colors">
                  <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">Demo</span>
                  <span className="block text-xl font-black text-emerald-600">0</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">Food Donations</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center relative group hover:border-slate-400 transition-colors">
                  <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">Demo</span>
                  <span className="block text-xl font-black text-emerald-600">0</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">NGO Connections</span>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center relative group hover:border-slate-400 transition-colors">
                  <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity">Demo</span>
                  <span className="block text-xl font-black text-emerald-600">0</span>
                  <span className="mt-1 block text-[9px] font-bold uppercase tracking-wider text-slate-500">Successful Deliveries</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="border-y border-slate-200/80 bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <SectionHeader
            kicker="The Problem"
            title="Every Meal Deserves a Purpose"
            subtitle="Every day, large amounts of edible food become surplus while many people and communities struggle to access sufficient food. Food Redistribution System helps connect available surplus food with organizations and communities that need it."
            justify
          />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about-section" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <SectionHeader
          kicker="About Us"
          title="What is Food Redistribution System?"
          subtitle="Food Redistribution System is a digital platform that connects food donors, NGOs, and volunteers to reduce food waste and make surplus food available to communities in need."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Food Donors', text: 'Restaurants, hotels, caterers, businesses, and households can list surplus food for redistribution.', icon: Building2 },
            { title: 'NGOs & Shelters', text: 'Verified NGOs and shelters can browse available food donations and submit requests for food they need.', icon: HeartHandshake },
            { title: 'Volunteers', text: 'Volunteers help collect and safely deliver donated food from donors to NGOs and designated communities.', icon: Truck }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/5 hover:ring-emerald-200"
              >
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-50/50 blur-2xl transition-all group-hover:bg-emerald-100"></div>
                <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
                  <Icon size={24} />
                </span>
                <h3 className="mt-6 text-xl font-black text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works-section" className="border-y border-emerald-100 bg-white py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
          <SectionHeader kicker="Process" title="How It Works" center />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-100 via-emerald-300 to-emerald-100 -translate-y-12"></div>

            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="relative group rounded-3xl bg-white p-6 text-center shadow-sm border border-slate-200 transition-all hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-400 bg-slate-50">
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center text-sm ring-4 ring-white shadow-sm z-10 group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <span className="relative mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-600 ring-1 ring-slate-200/60 transition-transform group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                    <Icon size={28} />
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm md:text-base font-medium text-slate-600 leading-relaxed">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features-section" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <SectionHeader kicker="Platform Capabilities" title="Features" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl bg-slate-50 p-6 transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 border border-slate-200 hover:border-emerald-400"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-emerald-500/0 transition-all group-hover:from-emerald-50/50 group-hover:to-transparent"></div>
                <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:ring-emerald-500">
                  <Icon size={22} />
                </span>
                <h3 className="relative mt-5 text-lg md:text-xl font-black text-slate-900 transition-colors group-hover:text-emerald-700">{item.title}</h3>
                <p className="relative mt-2 text-sm md:text-base font-medium text-slate-600 leading-relaxed">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* IMPACT STATS */}
      <section ref={impactRef} className="relative overflow-hidden bg-white py-24">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full bg-emerald-400/5 blur-[100px] pointer-events-none"></div>

        <div className="relative mx-auto w-full max-w-7xl px-4 md:px-6">
          <SectionHeader kicker="Real Impact" title="Platform Impact" center />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {impactStats.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.key} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 text-center shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 hover:ring-emerald-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-emerald-500/0 transition-all group-hover:from-emerald-50/50 group-hover:to-transparent"></div>

                  <span className="absolute top-0 right-0 bg-slate-50 text-slate-400 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl z-10 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">Demo</span>

                  <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-emerald-600 ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-500/30">
                    <Icon size={28} />
                  </div>

                  <p className="relative text-3xl font-black text-slate-900 mt-2 transition-colors group-hover:text-emerald-700">
                    {formatNumber(counts[item.key] || 0)}
                    <span className="text-emerald-500">{item.suffix}</span>
                  </p>
                  <p className="relative mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700">{item.label}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-emerald-500/20 blur-[120px]"></div>
        </div>
        <div className="relative mx-auto w-full max-w-4xl px-4 text-center md:px-6">
          <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
            Have Surplus Food? <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Don't Let It Go to Waste.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-slate-300 leading-relaxed md:text-xl">
            Join the Food Redistribution System and help turn surplus food into meaningful support for communities in need.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => onOpenAuth?.('register', 'donor')}
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-lg font-black text-white transition-all hover:bg-emerald-400 hover:shadow-xl hover:shadow-emerald-500/20 hover:-translate-y-1"
            >
              Register Now
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={() => onOpenAuth?.('login', 'donor')}
              className="inline-flex items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800/50 backdrop-blur-sm px-8 py-4 text-lg font-black text-white transition-all hover:border-slate-500 hover:bg-slate-700"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact-section" className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
        <SectionHeader kicker="Get in Touch" title="Contact Us" />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <Mail className="text-emerald-600" size={20} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Email</p>
            {/* REPLACE WITH REAL EMAIL LATER */}
            <p className="mt-1 text-sm font-bold text-slate-800">foodshare@gmail.com</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <Phone className="text-emerald-600" size={20} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</p>
            {/* REPLACE WITH REAL PHONE LATER */}
            <p className="mt-1 text-sm font-bold text-slate-800">+91 87659 84532</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <MapPin className="text-emerald-600" size={20} />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Address</p>
            {/* REPLACE WITH REAL ADDRESS LATER */}
            <p className="mt-1 text-sm font-bold text-slate-800">Nadiad, Gujarat, India</p>
          </article>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 md:grid-cols-4 md:px-6">
          <div>
            <h3 className="text-lg font-extrabold text-white">Food Redistribution System</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Connecting surplus food with communities in need. Reducing food waste and supporting communities.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Navigation</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#about-section" className="transition hover:text-white">About Us</a></li>
              <li><a href="#how-it-works-section" className="transition hover:text-white">How It Works</a></li>
              <li><a href="#features-section" className="transition hover:text-white">Features</a></li>
              <li><a href="#contact-section" className="transition hover:text-white">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Account Access</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <button type="button" onClick={() => onOpenAuth?.('login', 'donor')} className="transition hover:text-white">
                  Login
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenAuth?.('register', 'donor')} className="transition hover:text-white">
                  Register
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Connect</h4>
            <div className="mt-3 flex items-center gap-2">
              <a href="#" className="rounded-lg bg-slate-800 p-2 text-slate-300 transition hover:bg-emerald-600 hover:text-white" aria-label="Facebook">
                <Facebook size={17} />
              </a>
              <a href="#" className="rounded-lg bg-slate-800 p-2 text-slate-300 transition hover:bg-emerald-600 hover:text-white" aria-label="Instagram">
                <Instagram size={17} />
              </a>
              <a href="#" className="rounded-lg bg-slate-800 p-2 text-slate-300 transition hover:bg-emerald-600 hover:text-white" aria-label="LinkedIn">
                <Linkedin size={17} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
          © 2026 Food Redistribution System
        </div>
      </footer>
    </div>
  );
}