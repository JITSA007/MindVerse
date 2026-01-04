import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  Menu, X, Briefcase, BookOpen, Users, 
  Gamepad2, LogOut, ChevronRight, MessageCircle, 
  Shield, ExternalLink, Mail, Key, Star, Zap,
  CheckCircle, ArrowRight, Lock
} from 'lucide-react';

// --- CONFIGURATION ---
const ADMIN_EMAILS = ['admin@college.edu', 'jitendra.prajapat@college.edu']; 

// --- FIREBASE INIT ---
const firebaseConfig = {
  apiKey: "AIzaSyCgtaM_VdcBlPCsP4jWcfvlIHfzEnGsg5c",
  authDomain: "mindverse-edc1e.firebaseapp.com",
  projectId: "mindverse-edc1e",
  storageBucket: "mindverse-edc1e.firebasestorage.app",
  messagingSenderId: "522526203924",
  appId: "1:522526203924:web:434481f95f7c6c65f2c701",
  measurementId: "G-8BGCNPZ9MD"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
// Use a default app ID for the database path if the environment variable is missing
const appId = typeof __app_id !== 'undefined' ? __app_id : 'mindverse-app';

// --- VISUAL COMPONENTS ---

// 1. Blue & Orange Particle System
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.8 - 0.4;
        this.speedY = Math.random() * 0.8 - 0.4;
        // Mix of Blue and Orange
        this.isBlue = Math.random() > 0.4;
        this.color = this.isBlue 
          ? `rgba(59, 130, 246, ${Math.random() * 0.5 + 0.1})` // Blue-500
          : `rgba(249, 115, 22, ${Math.random() * 0.5 + 0.1})`; // Orange-500
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0; if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0; if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = this.color; ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    const init = () => { particles = []; for (let i = 0; i < 70; i++) particles.push(new Particle()); };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x; const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
             const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
             gradient.addColorStop(0, a.color);
             gradient.addColorStop(1, b.color);
             ctx.strokeStyle = gradient;
             ctx.lineWidth = 0.5;
             ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        });
      });
      particles.forEach(p => { p.update(); p.draw(); });
      animationFrameId = requestAnimationFrame(animate);
    };
    
    window.addEventListener('resize', resize); resize(); init(); animate();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-50" />;
};

const NewsTicker = ({ news }) => {
  if (!news || news.length === 0) return null;
  return (
    <div className="bg-slate-900 text-white overflow-hidden py-2 shadow-md relative z-30 border-b border-orange-500/30">
      <div className="flex whitespace-nowrap animate-marquee items-center">
        {[...news, ...news].map((item, index) => (
          <span key={index} className="mx-8 font-medium flex items-center text-sm">
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mr-2 uppercase tracking-wide">Update</span>
            {item.text}
          </span>
        ))}
      </div>
      <style>{`
        .animate-marquee { animation: marquee 35s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 transition-all hover:-translate-y-1 hover:shadow-2xl ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, type="button" }) => {
  const base = "px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm transform active:scale-95";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30",
    secondary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/30",
    outline: "border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-700 dark:text-slate-200 bg-transparent",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
    danger: "bg-red-500 hover:bg-red-600 text-white"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  );
};

// --- AUTH COMPONENTS ---

// 1. Student Login Modal
const StudentLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    try {
      if (isSignup) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(); onClose();
    } catch (err) { setError(err.message.replace('Firebase: ', '')); }
  };

  const handleGoogleLogin = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); onLoginSuccess(); onClose(); } 
    catch (err) { setError("Google Login failed."); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-400 flex flex-col items-center justify-center text-white">
           <h2 className="text-3xl font-black mb-1">MindVerse</h2>
           <p className="opacity-90 font-medium">Student Access</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="email" placeholder="Student Email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded">{error}</p>}
            
            <Button type="submit" className="w-full text-lg shadow-xl shadow-blue-500/20">
              {isSignup ? 'Create Account' : 'Login'}
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
            <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase font-bold">Or continue with</span>
          </div>
          
          <button onClick={handleGoogleLogin} className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-slate-700 dark:text-slate-300">
             <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
             Google
          </button>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {isSignup ? "Already have an account?" : "No account yet?"} 
            <button onClick={() => setIsSignup(!isSignup)} className="ml-1 text-blue-600 font-bold hover:underline">
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"><X size={20}/></button>
      </div>
    </div>
  );
};

// 2. Admin Login Screen (Separate URL logic simulated)
const AdminLoginScreen = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid Admin Credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-8 relative z-10">
        <button onClick={onBack} className="absolute top-4 left-4 text-slate-400 hover:text-white flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          <ArrowRight className="rotate-180" size={12}/> Back to Site
        </button>
        <div className="text-center mb-8 mt-6">
          <Shield className="w-16 h-16 mx-auto text-orange-500 mb-4" />
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">Restricted Area</h1>
          <p className="text-slate-400 text-sm mt-2">MindVerse Administrative Control</p>
        </div>
        <form onSubmit={handleAdminLogin} className="space-y-5">
           <div>
             <label className="text-xs font-bold text-slate-400 uppercase ml-1">Admin ID</label>
             <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
               className="w-full mt-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 outline-none transition-colors" />
           </div>
           <div>
             <label className="text-xs font-bold text-slate-400 uppercase ml-1">Secure Key</label>
             <input type="password" required value={password} onChange={e => setPassword(e.target.value)} 
               className="w-full mt-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-orange-500 outline-none transition-colors" />
           </div>
           {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded text-center">{error}</div>}
           <button type="submit" className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg shadow-orange-500/20 transition-all">
             Authenticate
           </button>
        </form>
      </div>
    </div>
  );
};

// --- PAGES ---

const Home = ({ navigate }) => (
  <div className="relative min-h-[90vh]">
    <div className="relative pt-20 pb-28 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 max-w-5xl mx-auto animate-fade-in-up">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold mb-8 tracking-widest uppercase border border-blue-200 dark:border-blue-700/50 backdrop-blur-sm">
          <Star size={12} fill="currentColor" /> Official CollegeDekho Students
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-6 leading-none tracking-tight">
          Mind<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-orange-500">Verse</span>
        </h1>
        <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Where Code Meets Creativity. <br/>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">Read. Innovate. Lead.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => navigate('archive')} className="px-8 py-4 text-lg shadow-xl shadow-blue-500/20">
            Read Latest Issue <BookOpen size={20} />
          </Button>
          <Button variant="secondary" onClick={() => navigate('playground')} className="px-8 py-4 text-lg">
            Enter Playground <Gamepad2 size={20} />
          </Button>
        </div>
      </div>
    </div>

    {/* Feature Grid */}
    <div className="max-w-7xl mx-auto px-4 pb-20 relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div onClick={() => navigate('jobs')} className="cursor-pointer group">
          <Card className="h-full bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none hover:-translate-y-2 transition-all duration-300">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Briefcase className="w-6 h-6 text-blue-100" />
            </div>
            <h3 className="text-xl font-bold mb-2">Student Jobs</h3>
            <p className="text-blue-100 text-sm opacity-90 mb-6 leading-relaxed">Curated internships and placement opportunities for CollegeDekho students.</p>
            <div className="flex items-center text-xs font-bold bg-white text-blue-700 w-fit px-4 py-2 rounded-lg">
              Find Work <ChevronRight size={14} className="ml-1" />
            </div>
          </Card>
        </div>
        <div onClick={() => navigate('confessions')} className="cursor-pointer group">
          <Card className="h-full bg-gradient-to-br from-orange-500 to-red-600 text-white border-none hover:-translate-y-2 transition-all duration-300">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-orange-100" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confessions</h3>
            <p className="text-orange-100 text-sm opacity-90 mb-6 leading-relaxed">Share your campus secrets anonymously or read what others are saying.</p>
            <div className="flex items-center text-xs font-bold bg-white text-orange-600 w-fit px-4 py-2 rounded-lg">
              Start Reading <ChevronRight size={14} className="ml-1" />
            </div>
          </Card>
        </div>
        <div onClick={() => navigate('team')} className="cursor-pointer group">
          <Card className="h-full bg-gradient-to-br from-slate-700 to-slate-900 text-white border-none hover:-translate-y-2 transition-all duration-300">
            <div className="bg-white/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Users className="w-6 h-6 text-slate-200" />
            </div>
            <h3 className="text-xl font-bold mb-2">Meet The Makers</h3>
            <p className="text-slate-300 text-sm opacity-90 mb-6 leading-relaxed">The students and mentors working behind the scenes of MindVerse.</p>
            <div className="flex items-center text-xs font-bold bg-white text-slate-800 w-fit px-4 py-2 rounded-lg">
              See Team <ChevronRight size={14} className="ml-1" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

const MagazineArchive = ({ magazines }) => (
  <div className="max-w-7xl mx-auto px-4 py-16">
    <div className="text-center mb-16">
      <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase text-sm">Library</span>
      <h2 className="text-4xl font-black text-slate-900 dark:text-white mt-2 mb-4">The Archive</h2>
      <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">Explore our collection of digital magazines. Click to read the full PDF.</p>
    </div>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {magazines.map((mag) => (
        <div key={mag.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 dark:border-slate-700">
          <div className="aspect-[3/4] bg-slate-200 relative overflow-hidden">
            <img src={mag.coverUrl || "https://placehold.co/400x600/orange/white?text=MindVerse+Cover"} alt={mag.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-blue-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
              <h4 className="text-white font-bold text-xl mb-4">{mag.title}</h4>
              <a href={mag.pdfUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" className="rounded-full px-6">Read Issue</Button>
              </a>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded uppercase tracking-wider">Issue #{mag.issueNumber}</span>
              <span className="text-xs text-slate-400 font-medium">Published: {mag.dateStr || '2025'}</span>
            </div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white truncate mb-1" title={mag.title}>{mag.title}</h3>
            <p className="text-slate-500 text-sm line-clamp-2">{mag.desc || 'A journey through tech and creativity.'}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const JobBoard = ({ jobs }) => (
  <div className="max-w-5xl mx-auto px-4 py-16">
    <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-slate-200 dark:border-slate-700 pb-6">
      <div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Career Launchpad</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Exclusive opportunities for MindVerse community.</p>
      </div>
    </div>
    <div className="grid gap-4">
      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
           <Briefcase className="w-12 h-12 mx-auto text-slate-300 mb-3" />
           <p className="text-slate-500">No active job listings. Check back later!</p>
        </div>
      ) : (
        jobs.map(job => (
          <Card key={job.id} className="group flex flex-col md:flex-row justify-between items-center gap-6 hover:border-blue-500/50 transition-colors">
            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${job.type === 'Internship' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {job.type}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-2">{job.company} • {job.location || 'Remote'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{job.description}</p>
            </div>
            <a href={job.link} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button variant="outline" className="w-full">Apply Now <ExternalLink size={14}/></Button>
            </a>
          </Card>
        ))
      )}
    </div>
  </div>
);

// --- UPDATED TEAM PAGE ---
const TeamPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Meet The Makers</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">The brilliant minds, creators, and mentors behind MindVerse.</p>
      </div>

      {/* 1. VISIONARY LEADER (Jitendra Prajapat) */}
      <div className="mb-20">
         <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
           {/* Decorative elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
             <div className="shrink-0">
               <div className="w-48 h-48 rounded-full p-1.5 bg-gradient-to-tr from-orange-400 to-blue-500 shadow-2xl">
                  <img src="https://ui-avatars.com/api/?name=Jitendra+Prajapat&background=0f172a&color=fff&size=256&font-size=0.35" alt="Jitendra Prajapat" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
               </div>
             </div>
             <div className="text-center md:text-left flex-1">
               <div className="inline-block px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold mb-6 tracking-widest uppercase shadow-lg shadow-orange-500/20">Visionary Leader & Mentor</div>
               <h3 className="text-4xl font-bold mb-2">Mr. Jitendra Prajapat</h3>
               <p className="text-blue-200 text-lg mb-6 font-medium">Assistant Professor, SOET</p>
               <p className="text-slate-300 leading-relaxed text-lg">
                 "Guiding students to bridge the gap between imagination and reality." <br/>
                 His unwavering support and technical vision have been the cornerstone of the MindVerse initiative, empowering students to create, innovate, and lead.
               </p>
             </div>
           </div>
         </div>
      </div>

      {/* 2. CORE TEAM */}
      <div className="mb-20">
        <h3 className="text-2xl font-bold text-center mb-10 text-slate-800 dark:text-white flex items-center justify-center gap-3">
          <div className="h-1 w-12 bg-blue-600 rounded-full"></div> Core Team <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Kumari Shreya", role: "Editor-in-Chief", color: "from-pink-500 to-rose-500" },
            { name: "Naman Jain", role: "Lead Designer", color: "from-blue-500 to-cyan-500" },
            { name: "Saloni Tiwari", role: "Designer & Content", color: "from-purple-500 to-indigo-500" },
            { name: "Jatin Sharma", role: "Outreach & Content", color: "from-emerald-500 to-teal-500" },
            { name: "Shailesh Soni", role: "Social Media Head", color: "from-orange-500 to-amber-500" },
            { name: "Lavesh", role: "Designer", color: "from-blue-500 to-indigo-500" },
          ].map((member, idx) => (
            <Card key={idx} className="text-center group hover:border-blue-500/30">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full p-1 bg-gradient-to-r ${member.color}`}>
                <img src={`https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random`} alt={member.name} className="w-full h-full rounded-full border-4 border-white dark:border-slate-800" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{member.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide mt-1">{member.role}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* 3. CONTRIBUTORS */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-10 text-slate-800 dark:text-white flex items-center justify-center gap-3">
           <div className="h-1 w-8 bg-slate-300 rounded-full"></div> Contributors <div className="h-1 w-8 bg-slate-300 rounded-full"></div>
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            "Anshika Verma", "Tanisha Chitlangia", "Devesh Soni", 
            "Vaibhavi Gupta", "Mayank Saini", "Divyanshi", "Shivank", "Simranjeet Singh (Mentor)", "Juhi Kumari (Mentor)"
          ].map((name, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm">
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN PANEL ---
const AdminPanel = ({ user, setView }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Forms
  const [newsText, setNewsText] = useState('');
  const [jobForm, setJobForm] = useState({ title: '', company: '', type: 'Internship', location: '', link: '', description: '' });
  const [magForm, setMagForm] = useState({ title: '', issueNumber: '', coverUrl: '', pdfUrl: '', dateStr: '' });

  const handleAddNews = async (e) => {
    e.preventDefault(); if(!newsText) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'news'), { text: newsText, createdAt: serverTimestamp() });
    setNewsText(''); alert('News added!');
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'jobs'), { ...jobForm, createdAt: serverTimestamp() });
    alert('Job Posted!'); setJobForm({ title: '', company: '', type: 'Internship', location: '', link: '', description: '' });
  };

  const handleUploadMag = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'magazines'), { ...magForm, createdAt: serverTimestamp() });
    alert('Magazine Published!'); setMagForm({ title: '', issueNumber: '', coverUrl: '', pdfUrl: '', dateStr: '' });
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 pt-20">
      <div className="w-64 bg-slate-900 text-white p-6 hidden md:block fixed h-full top-0 pt-24 z-20">
        <h2 className="text-xl font-bold mb-8 flex items-center gap-2 tracking-wide text-orange-500"><Shield size={20}/> ADMIN PANEL</h2>
        <nav className="space-y-2">
          {['dashboard', 'magazines', 'jobs', 'news'].map(sec => (
            <button key={sec} onClick={() => setActiveSection(sec)} 
              className={`w-full text-left px-4 py-3 rounded-lg capitalize font-medium transition-colors ${activeSection === sec ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              {sec}
            </button>
          ))}
        </nav>
        <button onClick={() => setView('home')} className="mt-8 text-sm text-slate-500 hover:text-white flex items-center gap-2">
          <ArrowRight className="rotate-180" size={14}/> Back to Website
        </button>
      </div>
      <div className="flex-1 p-8 md:ml-64">
        <h1 className="text-3xl font-bold mb-8 capitalize text-slate-800 dark:text-white border-b pb-4 dark:border-slate-700">{activeSection} Manager</h1>
        
        {activeSection === 'dashboard' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
               <BookOpen className="mb-4 opacity-80"/>
               <h3 className="text-2xl font-bold">Upload Issue</h3>
               <p className="text-blue-100 mb-4">Add new PDF magazines.</p>
               <Button variant="secondary" onClick={() => setActiveSection('magazines')} className="w-full">Go to Upload</Button>
             </Card>
             <Card>
               <Briefcase className="mb-4 text-blue-600"/>
               <h3 className="text-2xl font-bold text-slate-800">Post Job</h3>
               <p className="text-slate-500 mb-4">Add internships.</p>
               <Button variant="outline" onClick={() => setActiveSection('jobs')} className="w-full">Create Post</Button>
             </Card>
           </div>
        )}

        {activeSection === 'magazines' && (
           <Card className="max-w-2xl">
             <form onSubmit={handleUploadMag} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input value={magForm.title} onChange={e => setMagForm({...magForm, title: e.target.value})} className="p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" placeholder="Magazine Title" required />
                 <input value={magForm.issueNumber} onChange={e => setMagForm({...magForm, issueNumber: e.target.value})} className="p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" placeholder="Issue No. (e.g. 12)" required />
               </div>
               <input value={magForm.dateStr} onChange={e => setMagForm({...magForm, dateStr: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" placeholder="Date (e.g. October 2025)" />
               <input value={magForm.coverUrl} onChange={e => setMagForm({...magForm, coverUrl: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" placeholder="Cover Image URL (JPG/PNG)" />
               <input value={magForm.pdfUrl} onChange={e => setMagForm({...magForm, pdfUrl: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600" placeholder="PDF Document URL" required />
               <Button type="submit" className="w-full">Publish to Archive</Button>
             </form>
           </Card>
        )}
        
        {activeSection === 'news' && (
          <Card className="max-w-xl">
             <form onSubmit={handleAddNews}>
              <h3 className="font-bold mb-4">Add Breaking News</h3>
              <input value={newsText} onChange={e => setNewsText(e.target.value)} className="w-full p-3 border rounded-lg mb-4 dark:bg-slate-700" placeholder="Ticker text..." />
              <Button type="submit">Update Ticker</Button>
             </form>
          </Card>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Modals/Screens
  const [studentLoginOpen, setStudentLoginOpen] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  
  // Data
  const [news, setNews] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [magazines, setMagazines] = useState([
    { id: '1', issueNumber: '1', title: 'Tech & Science', dateStr: 'September 2025', desc: 'The inaugural issue covering the basics of AI.', coverUrl: 'https://placehold.co/400x520/1e40af/FFF?text=Issue+1', pdfUrl: '#' },
    { id: '2', issueNumber: '2', title: 'The Art of AI', dateStr: 'October 2025', desc: 'Exploring Generative AI and creativity.', coverUrl: 'https://placehold.co/400x520/ea580c/FFF?text=Issue+2', pdfUrl: '#' },
    { id: '3', issueNumber: '3', title: 'Code & Verse', dateStr: 'December 2025', desc: 'A fusion of poetry and programming.', coverUrl: 'https://placehold.co/400x520/4f46e5/FFF?text=Issue+3', pdfUrl: '#' }
  ]);

  // 1. Auth Initialization Effect
  useEffect(() => {
    const initAuth = async () => {
      // Prioritize custom token if available (e.g., from environment)
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (err) {
           console.warn("Custom token invalid, falling back to anonymous auth.");
           await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    // Listen for auth state changes
    const unsubAuth = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u && ADMIN_EMAILS.includes(u.email)) setView('admin'); // Auto-redirect admin
    });

    return () => unsubAuth();
  }, []);

  // 2. Data Fetching Effect (Dependent on User)
  useEffect(() => {
    // CRITICAL: Do not attempt to fetch data until user is authenticated
    if (!user) return;

    // Helper to log errors without crashing the app
    const logError = (context) => (err) => console.log(`Error fetching ${context}:`, err);

    // Fetch News
    const qNews = query(collection(db, 'artifacts', appId, 'public', 'data', 'news'), orderBy('createdAt', 'desc'), limit(5));
    const unsubNews = onSnapshot(qNews, s => {
      const data = s.docs.map(d => d.data());
      setNews(data.length > 0 ? data : [{text: "Welcome to MindVerse! Issue #3 is out now."}]);
    }, logError("news"));

    // Fetch Jobs
    const qJobs = query(collection(db, 'artifacts', appId, 'public', 'data', 'jobs'), orderBy('createdAt', 'desc'), limit(10));
    const unsubJobs = onSnapshot(qJobs, s => setJobs(s.docs.map(d => ({id: d.id, ...d.data()}))), logError("jobs"));

    // Fetch Magazines
    const qMags = query(collection(db, 'artifacts', appId, 'public', 'data', 'magazines'), orderBy('createdAt', 'desc'));
    const unsubMags = onSnapshot(qMags, s => {
       const uploaded = s.docs.map(d => ({id: d.id, ...d.data()}));
       if(uploaded.length > 0) setMagazines(uploaded); 
    }, logError("magazines"));

    return () => { unsubNews(); unsubJobs(); unsubMags(); };
  }, [user]);

  const navigate = (page) => { setView(page); setMenuOpen(false); window.scrollTo(0,0); };

  // Handle Admin Login Flow
  if (showAdminLogin) {
    return <AdminLoginScreen onBack={() => setShowAdminLogin(false)} onLoginSuccess={() => { setShowAdminLogin(false); setView('admin'); }} />;
  }

  // Handle Admin View (Protected)
  if (view === 'admin') {
     return <AdminPanel user={user} setView={setView} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans selection:bg-orange-500 selection:text-white">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all shadow-sm">
        <NewsTicker news={news} />
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('home')}>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">M</div>
            <div>
              <span className="font-bold text-xl block leading-none tracking-tight">MindVerse</span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold">CollegeDekho Students</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600 dark:text-slate-300">
            {['home', 'archive', 'jobs', 'team'].map(item => (
              <button key={item} onClick={() => navigate(item)} 
                className={`hover:text-blue-600 dark:hover:text-blue-400 capitalize transition-colors ${view === item ? 'text-blue-600 dark:text-blue-400' : ''}`}>
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                 {ADMIN_EMAILS.includes(user.email) && (
                   <button onClick={() => setView('admin')} className="text-[10px] font-black bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">ADMIN</button>
                 )}
                 <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=0ea5e9&color=fff`} className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-700 shadow-sm" alt="Profile"/>
                 <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={18}/></button>
              </div>
            ) : (
              <Button onClick={() => setStudentLoginOpen(true)} variant="primary" className="py-2 px-6 shadow-blue-500/20">Login</Button>
            )}
            <button className="md:hidden text-slate-700 dark:text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-white dark:bg-slate-900 pt-32 px-8 md:hidden animate-fade-in">
          <nav className="flex flex-col gap-6 text-2xl font-black text-slate-800 dark:text-white">
            <button onClick={() => navigate('home')}>Home</button>
            <button onClick={() => navigate('archive')}>Archive</button>
            <button onClick={() => navigate('jobs')}>Jobs</button>
            <button onClick={() => navigate('team')}>Team</button>
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
            <button onClick={() => setShowAdminLogin(true)} className="text-sm font-bold text-slate-400 uppercase tracking-widest">Admin Access</button>
          </nav>
        </div>
      )}

      {/* STUDENT LOGIN MODAL */}
      <StudentLoginModal isOpen={studentLoginOpen} onClose={() => setStudentLoginOpen(false)} onLoginSuccess={() => setStudentLoginOpen(false)} />

      {/* CONTENT */}
      <main className="pt-28 min-h-screen">
        {view === 'home' && <Home navigate={navigate} />}
        {view === 'archive' && <MagazineArchive magazines={magazines} />}
        {view === 'jobs' && <JobBoard jobs={jobs} />}
        {view === 'team' && <TeamPage />}
        {view === 'playground' && <div className="text-center py-20"><Gamepad2 size={48} className="mx-auto mb-4 text-orange-500"/><h2 className="text-2xl font-bold">Playground Loading...</h2><p>Coming in next update!</p></div>}
        {view === 'confessions' && <div className="text-center py-20"><MessageCircle size={48} className="mx-auto mb-4 text-orange-500"/><h2 className="text-2xl font-bold">Confessions Coming Soon</h2></div>}
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-16 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-black mb-4 flex items-center gap-2 text-blue-600"><div className="w-8 h-8 bg-blue-600 rounded-lg"></div> MindVerse</h2>
            <p className="text-slate-500 max-w-sm mb-6">Empowering CollegeDekho students to write, share, and inspire. The official campus digital magazine platform.</p>
            <div className="flex gap-4">
               {/* Social Icons */}
               {[1,2,3].map(i => <div key={i} className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-colors cursor-pointer flex items-center justify-center text-slate-400"><ExternalLink size={14}/></div>)}
            </div>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => navigate('archive')} className="hover:text-blue-600">Magazine Archive</button></li>
              <li><button onClick={() => navigate('jobs')} className="hover:text-blue-600">Student Jobs</button></li>
              <li><button onClick={() => navigate('team')} className="hover:text-blue-600">Our Team</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Internal</h3>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => setStudentLoginOpen(true)} className="hover:text-blue-600">Student Login</button></li>
              <li><button onClick={() => setShowAdminLogin(true)} className="hover:text-orange-500 flex items-center gap-1 transition-colors"><Lock size={12}/> Admin Portal</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-400 text-sm">
          © 2026 MindVerse • Built with ❤️ by CollegeDekho Students
        </div>
      </footer>
    </div>
  );
}