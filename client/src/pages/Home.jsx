import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CityContext } from '../context/CityContext';
import { Search, Sparkles, Building2, ShieldCheck, MapPin, GraduationCap, Briefcase, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Home() {
  const { cities, selectedCity } = useContext(CityContext);
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      
      {/* HERO SECTION */}
      <section style={{ position: 'relative', padding: '5rem 0 4rem 0', background: 'radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.08) 0%, #ffffff 70%)', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '900px' }}>
          
          {/* AI Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.4rem 1rem', borderRadius: '9999px', color: '#2563eb', fontSize: '0.88rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <Sparkles size={16} color="#2563eb" /> AI/ML-Powered Accommodation Recommendation System
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
            Find Your Perfect PG Near Your <span style={{ background: 'linear-gradient(135deg, #2563eb 0%, #16a34a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>College or Office</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#475569', marginBottom: '2.5rem', lineHeight: '1.7' }}>
            Tell us your target college or office, budget, preferred facilities and room requirements. Our smart machine learning model ranks nearby PGs based on multi-factor suitability, not just distance alone.
          </p>

          {/* Quick Dual Role Search CTA Card */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', maxWidth: '750px', margin: '0 auto' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Who are you searching for?
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              
              <button
                onClick={() => navigate('/search?role=student')}
                className="btn"
                style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', height: 'auto', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#ffffff', boxShadow: '0 4px 15px rgba(22,163,74,0.3)' }}
              >
                <GraduationCap size={28} />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>I am a Student</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>Find PGs near my College/Institute</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/search?role=working_professional')}
                className="btn"
                style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', borderRadius: '12px', height: 'auto', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}
              >
                <Briefcase size={28} color="#ffffff" />
                <div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Working Professional</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: 500 }}>Find PGs near my Office/Workplace</div>
                </div>
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              How PG Finder AI Works
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem' }}>4 Simple Steps to Get Your Best Recommended Accommodation</p>
          </div>

          <div className="grid-4">
            
            {/* Step 1: Blue */}
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: '#eff6ff', width: '50px', height: '50px', borderRadius: '12px', color: '#2563eb', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #bfdbfe' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.4rem', fontWeight: 700 }}>Select College or Office</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>Pick your target college or corporate park in your city.</p>
            </div>

            {/* Step 2: Yellow */}
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: '#fef3c7', width: '50px', height: '50px', borderRadius: '12px', color: '#d97706', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #fde047' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.4rem', fontWeight: 700 }}>Tell Us Preferences</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>Specify budget, AC, food, Wi-Fi, laundry, and room sharing type.</p>
            </div>

            {/* Step 3: Green */}
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: '#dcfce7', width: '50px', height: '50px', borderRadius: '12px', color: '#16a34a', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #86efac' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.4rem', fontWeight: 700 }}>AI Analyzes Suitability</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>Multi-factor scoring algorithms evaluate price fit, amenities, ratings, and proximity.</p>
            </div>

            {/* Step 4: Red */}
            <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ background: '#fee2e2', width: '50px', height: '50px', borderRadius: '12px', color: '#dc2626', fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #fca5a5' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.4rem', fontWeight: 700 }}>Get Best Matches</h3>
              <p style={{ fontSize: '0.85rem', color: '#475569' }}>View ranked results with clear match % scores and reason explanations.</p>
            </div>

          </div>
        </div>
      </section>

      {/* POPULAR CITIES SECTION */}
      <section style={{ padding: '4rem 0', background: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Explore Top Cities</h2>
              <p style={{ color: '#475569', fontSize: '0.9rem' }}>Verified PG accommodations near top educational & corporate hubs</p>
            </div>
            <Link to="/search" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid-4">
            {cities && cities.slice(0, 8).map((city) => (
              <div
                key={city._id}
                onClick={() => navigate(`/search?cityId=${city._id}`)}
                className="glass-card"
                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ background: '#eff6ff', padding: '0.75rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <MapPin size={24} color="#2563eb" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{city.cityName}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{city.state}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* PG OWNER CTA */}
      <section style={{ padding: '4rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FOR PROPERTY OWNERS</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
              Are you a PG Owner? List Your Property Today
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', maxWidth: '600px' }}>
              Get your PG listed in our smart AI recommendation engine. Connect directly with students and professionals looking for quality stays near their colleges and workplaces.
            </p>
          </div>
          <Link to="/register?role=pg_owner" className="btn btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
            List Your PG Now
          </Link>
        </div>
      </section>

    </div>
  );
}
