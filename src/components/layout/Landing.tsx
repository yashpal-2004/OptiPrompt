import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/AuthContext';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Plus, Zap, Activity, Shield, Cpu } from 'lucide-react';

export function Landing() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in!');
    } catch (error: any) {
      toast.error('Failed to sign in', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <div className="grid-bg-overlay" />
      
      {/* Navbar */}
      <header className="container">
        <nav className="navbar">
          <div className="logo">OPTIPROMPT<span className="text-red">.</span></div>
          <div className="nav-links">
            <a href="#about" className="nav-link">Architecture</a>
            <a href="#work" className="nav-link">Laboratory</a>
            <a href="#services" className="nav-link">Intelligence</a>
            <Link to="/status" className="nav-link">Node</Link>
          </div>
          <button className="btn-start" onClick={handleGoogleSignIn}>Initialize Node</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container hero">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hero-subtitle"
        >
          Neural Engineering & Optimization Studio
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="hero-title"
        >
          We Engineer High-Density <span className="text-red">Prompts</span>
        </motion.h1>

        <div className="hero-bottom">
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-desc"
          >
            OptiPrompt is a premier creative laboratory focused on the intersection of AI logic and semantic efficiency. We transform raw instructions into high-performance neural vectors that reduce token costs while maximizing intelligence output.
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-explore"
            onClick={handleGoogleSignIn}
            style={{ cursor: 'pointer' }}
          >
            <span>Enter Laboratory</span>
            <div className="explore-circle">
              <ArrowRight size={20} />
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="stats">
          <div className="stat-item">
            <span className="stat-number">12.5M+</span>
            <span className="stat-label">Tokens Optimized</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">40%</span>
            <span className="stat-label">Average Cost Reduction</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">99.9%</span>
            <span className="stat-label">System Uptime</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">Sub-10ms</span>
            <span className="stat-label">Optimization Latency</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container about">
        <div className="about-label">The Architecture</div>
        <div className="about-content">
          <h2>We Are A <span className="text-red">Neural</span> Powerhouse</h2>
          <p>
            Driven by semantic precision, we refine the dialogue between humans and machines. 
            Our architecture collapses redundant context and injects structural clarity, ensuring your AI interactions are as efficient as they are intelligent.
          </p>
        </div>
      </section>

      {/* Works Section */}
      <section id="work" className="container works">
        <div className="works-header">
          <h2>Neural <span className="text-red">Laboratory</span> // Diagnostic Gallery</h2>
          <div className="hero-explore" onClick={handleGoogleSignIn} style={{ cursor: 'pointer' }}>
            <span>Run Experiment</span>
            <div className="explore-circle">
              <Plus size={20} />
            </div>
          </div>
        </div>

        <div className="works-grid">
          <div className="work-item work-1">
            <img src="/images/ai_prompt_optimization_viz_1777236841858.png" alt="Neural Synthesis" />
            <div className="work-info">
              <span className="work-title">Neural Synthesis</span>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="work-item work-2">
            <img src="/images/token_compression_art_1777236855139.png" alt="Token Compression" />
            <div className="work-info">
              <span className="work-title">Token Compression</span>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="work-item work-3">
            <img src="/images/neural_network_studio_1777236873106.png" alt="Prompt Engineering" />
            <div className="work-info">
              <span className="work-title">Prompt Engineering</span>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="work-item work-4">
            <img src="/images/data_analytics_dashboard_art_1777236889618.png" alt="Core Diagnostics" />
            <div className="work-info">
              <span className="work-title">Core Diagnostics</span>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="work-item work-5">
            <img src="/images/cybernetic_prompt_flow_1777236906139.png" alt="Semantic Flow" />
            <div className="work-info">
              <span className="work-title">Semantic Flow</span>
              <ArrowRight size={16} />
            </div>
          </div>
          <div className="work-item work-6">
            <img src="/images/ai_intelligence_hub_1777236921770.png" alt="Intelligence Core" />
            <div className="work-info">
              <span className="work-title">Intelligence Core</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="container section-padding" style={{ borderTop: '1.5px solid rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '100px' }}>
          <div className="about-label">Intelligence Layers</div>
          <div>
            <h2 style={{ fontSize: '72px', marginBottom: '40px' }}>Capabilities That Drive <span className="text-red">Efficiency</span></h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {[
                { id: '01', title: 'Contextual Compression', desc: 'We utilize advanced NLP techniques to collapse redundant context, reducing your token footprint by up to 60% without losing technical depth.' },
                { id: '02', title: 'Neural Refinement', desc: 'Structural optimization of prompt vectors to ensure maximum clarity and reasoning performance across LLM architectures.' },
                { id: '03', title: 'Diagnostic Analytics', desc: 'Real-time monitoring of prompt performance, token savings, and cost-efficiency metrics across your entire intelligence pipeline.' }
              ].map(service => (
                <div key={service.id} style={{ display: 'flex', gap: '40px', padding: '40px 0', borderTop: '1.5px solid rgba(0,0,0,0.08)' }}>
                  <span style={{ fontSize: '24px', fontWeight: 800, color: '#e61e2a' }}>{service.id}</span>
                  <div>
                    <h3 style={{ fontSize: '32px', marginBottom: '15px' }}>{service.title}</h3>
                    <p style={{ color: 'rgba(0,0,0,0.4)', fontSize: '16px', maxWidth: '500px' }}>{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container" style={{ padding: '60px 0', borderTop: '1.5px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo" style={{ fontSize: '18px' }}>OPTIPROMPT<span className="text-red">.</span></div>
        <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', fontWeight: 700, textTransform: 'uppercase' }}>
          © 2026 OptiPrompt. Neural Optimization Node 12-A.
        </div>
        <div className="nav-links" style={{ gap: '20px' }}>
          <Link to="/privacy" className="nav-link" style={{ fontSize: '11px' }}>Privacy</Link>
          <Link to="/terms" className="nav-link" style={{ fontSize: '11px' }}>Terms</Link>
        </div>
      </footer>
    </div>
  );
}
