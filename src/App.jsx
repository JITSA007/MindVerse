import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Cpu, 
  Users, 
  Send, 
  Search, 
  Menu, 
  X, 
  TrendingUp, 
  Calendar, 
  Award, 
  Shield, 
  Edit3, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Play, 
  Moon, 
  Sun,
  Code,
  FileText,
  Lock,
  LogIn,
  UserPlus,
  CheckCircle,
  XCircle,
  Globe,
  BarChart,
  RefreshCw,
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

// --- Firebase Configuration (UPDATED WITH YOUR KEYS) ---
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
const auth = getAuth(app);
const db = getFirestore(app);

// Fixed Collection ID for Firestore to prevent crashes
const appCollectionId = "mindverse-v1"; 

// --- Constants & Mock Data ---
const ADMIN_EMAIL = "admin@mindverse.com"; // Simulating an admin user check

const OFFICE_BEARERS = {
  mentors: [
    { name: "Prof. Jitendra Prajapat", role: "Lead Mentor & Asst. Professor", dept: "SOET" },
    { name: "Simranjeet Singh", role: "Supporting Mentor", dept: "Faculty" },
    { name: "Juhi Kumari", role: "Supporting Mentor", dept: "Faculty" },
  ],
  core: [
    { name: "Kumari Shreya", role: "Editor-in-Chief" },
    { name: "Naman Jain", role: "Head of Design" },
    { name: "Jatin Sharma", role: "Outsource & Ops" },
    { name: "Shailesh Soni", role: "Social Media Lead" },
  ],
  contributors: [
    "Saloni Tiwari", "Lavesh", "Tanisha Chitlangia", "Anshika Verma", 
    "Devesh Soni", "Divyanshi", "Shivank", "Vaibhavi Gupta", "Mayank Saini"
  ]
};

// --- Helper Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center shadow-md active:scale-95";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-slate-800",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-bold mb-1 opacity-70">{label}</label>}
    <input 
      className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none dark:bg-slate-900 dark:border-slate-700 dark:text-white transition"
      {...props}
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-bold mb-1 opacity-70">{label}</label>}
    <textarea 
      className="w-full p-3 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none dark:bg-slate-900 dark:border-slate-700 dark:text-white transition min-h-[120px]"
      {...props}
    />
  </div>
);

// --- Feature Components ---

// 1. Navigation
const Navbar = ({ view, setView, toggleTheme, theme, user, onLogout }) => (
  <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-white/80 border-gray-200 text-gray-900'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg mr-3 shadow-lg group-hover:rotate-12 transition duration-300">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">CD MINDVERSE</span>
            <span className="text-[10px] uppercase tracking-[0.2em] opacity-70 font-bold">Code & Verse</span>
          </div>
        </div>
        
        <div className="hidden lg:flex space-x-6 items-center font-medium text-sm">
          {['home', 'archive', 'team', 'playground', 'write'].map((item) => (
             <button 
               key={item}
               onClick={() => setView(item)} 
               className={`capitalize px-3 py-1 rounded-full transition-all duration-200 ${view === item ? 'bg-blue-100 text-blue-700 dark:bg-slate-800 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}
             >
               {item === 'write' ? 'Write Blog' : item}
             </button>
          ))}

          <div className="h-6 w-px bg-gray-300 dark:bg-slate-700 mx-2"></div>

          {user ? (
            <div className="flex items-center space-x-3">
              <button onClick={() => setView('admin')} className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-bold flex items-center">
                <Shield size={16} className="mr-1" /> Panel
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs cursor-pointer" title={user.email}>
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <button onClick={onLogout} className="text-red-500 hover:text-red-600 text-xs">Sign Out</button>
            </div>
          ) : (
            <button onClick={() => setView('auth')} className="flex items-center text-blue-600 hover:text-blue-700 font-bold">
              <LogIn size={16} className="mr-1" /> Login
            </button>
          )}
          
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition text-yellow-500">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Mobile Menu Icon */}
        <div className="lg:hidden flex items-center space-x-4">
           <button onClick={toggleTheme}>
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           <button onClick={() => setView('home')}><Menu className="h-6 w-6" /></button>
        </div>
      </div>
    </div>
  </nav>
);

// 2. Auth Component
const AuthModal = ({ theme, onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // Redirect after auth
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-full bg-blue-100 dark:bg-slate-700 mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold">{isSignup ? 'Join the Community' : 'Welcome Back'}</h2>
          <p className="opacity-60 mt-2">Sign in to access the portal and submit blogs.</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm flex items-center"><XCircle size={16} className="mr-2" />{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="student@jnu.ac.in" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <Button className="w-full py-3 text-lg" type="submit">
            {isSignup ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="opacity-70">{isSignup ? 'Already have an account?' : 'New to Mindverse?'}</span>
          <button 
            onClick={() => setIsSignup(!isSignup)} 
            className="ml-2 font-bold text-blue-600 hover:underline"
          >
            {isSignup ? 'Login here' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Admin & Guest Editor
const ContentEditor = ({ theme, user, mode = 'guest' }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('Tech News');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login first");
    
    setLoading(true);
    try {
      const collectionName = mode === 'admin' ? 'articles' : 'guest_posts';
      // If admin, post directly. If guest, status is pending.
      const payload = {
        title,
        content,
        image,
        category,
        author: user.email,
        authorId: user.uid,
        createdAt: serverTimestamp(),
        status: mode === 'admin' ? 'published' : 'pending',
        seo: {
          metaTitle: seoTitle || title,
          metaDescription: seoDesc || content.substring(0, 150),
          keywords: category
        }
      };

      await addDoc(collection(db, 'artifacts', appCollectionId, 'public', 'data', collectionName), payload);
      alert(mode === 'admin' ? "Article Published Successfully!" : "Blog Submitted for Review!");
      setTitle(''); setContent(''); setImage('');
    } catch (err) {
      console.error(err);
      alert("Error submitting content.");
    }
    setLoading(false);
  };

  return (
    <div className={`max-w-4xl mx-auto p-6 md:p-10 rounded-2xl shadow-xl border my-10 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
      <div className="flex items-center mb-8 pb-4 border-b border-gray-200 dark:border-slate-700">
        <div className={`p-3 rounded-xl mr-4 ${mode === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
          {mode === 'admin' ? <Shield size={24} /> : <Edit3 size={24} />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{mode === 'admin' ? 'Admin Content Studio' : 'Submit Guest Blog'}</h2>
          <p className="opacity-60 text-sm">{mode === 'admin' ? 'Publish official content & SEO settings' : 'Share your tech insights with the college'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input 
            label="Article Title" 
            placeholder="e.g., The Future of Quantum Computing" 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div className="mb-4">
             <label className="block text-sm font-bold mb-1 opacity-70">Category</label>
             <select 
               value={category}
               onChange={(e) => setCategory(e.target.value)}
               className={`w-full p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
             >
               <option>Tech News</option>
               <option>Campus Buzz</option>
               <option>Creative Corner</option>
               <option>AI Tools</option>
               <option>Student Blog</option>
             </select>
          </div>
        </div>

        <Input 
          label="Cover Image URL (Optional)" 
          placeholder="https://example.com/image.jpg" 
          value={image} 
          onChange={e => setImage(e.target.value)}
        />

        <TextArea 
          label="Content (Markdown Supported)" 
          placeholder="# Introduction&#10;Write your article content here..." 
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          style={{ minHeight: '300px' }}
        />

        {/* SEO Section - Only for Admin or Advanced Guest Mode */}
        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center mb-4 text-blue-500 font-bold">
            <Globe size={18} className="mr-2" /> SEO Settings
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Input 
              label="Meta Title" 
              placeholder="SEO Friendly Title" 
              value={seoTitle} 
              onChange={e => setSeoTitle(e.target.value)}
            />
            <Input 
              label="Meta Description" 
              placeholder="Short summary for search engines" 
              value={seoDesc} 
              onChange={e => setSeoDesc(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="w-full md:w-auto px-8">
            {loading ? <RefreshCw className="animate-spin" /> : (mode === 'admin' ? 'Publish Live' : 'Submit for Review')}
          </Button>
        </div>
      </form>
    </div>
  );
};

// 4. Admin Dashboard (Full Features)
const AdminPanel = ({ theme, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingPosts, setPendingPosts] = useState([]);
  const [tickerItems, setTickerItems] = useState([]);
  const [newTicker, setNewTicker] = useState("");
  const [issues, setIssues] = useState([]);
  const [newIssue, setNewIssue] = useState({ title: '', month: '', image: '', number: '' });

  // Listeners
  useEffect(() => {
    if (!user) return;
    
    // Fetch Pending Posts
    const qPending = query(collection(db, 'artifacts', appCollectionId, 'public', 'data', 'guest_posts'), where('status', '==', 'pending'));
    const unsubPending = onSnapshot(qPending, snap => {
      setPendingPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("Guest posts error:", err));

    // Fetch Ticker
    // Use a document path with even segments (settings/config)
    const unsubTicker = onSnapshot(doc(db, 'artifacts', appCollectionId, 'public', 'data', 'settings', 'config'), doc => {
      if (doc.exists()) setTickerItems(doc.data().ticker || []);
    }, err => console.error("Ticker error:", err));

    // Fetch Issues
    const qIssues = query(collection(db, 'artifacts', appCollectionId, 'public', 'data', 'issues'), orderBy('number', 'desc'));
    const unsubIssues = onSnapshot(qIssues, snap => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("Issues error:", err));

    return () => { unsubPending(); unsubTicker(); unsubIssues(); };
  }, [user]);

  // Actions
  const approvePost = async (post) => {
    try {
      // Add to main articles
      await addDoc(collection(db, 'artifacts', appCollectionId, 'public', 'data', 'articles'), {
        ...post,
        status: 'published',
        approvedBy: user.email,
        publishedAt: serverTimestamp()
      });
      // Delete from guest_posts
      await deleteDoc(doc(db, 'artifacts', appCollectionId, 'public', 'data', 'guest_posts', post.id));
      alert("Post Approved & Published!");
    } catch(err) { console.error(err); }
  };

  const rejectPost = async (id) => {
    if(confirm("Reject this post?")) await deleteDoc(doc(db, 'artifacts', appCollectionId, 'public', 'data', 'guest_posts', id));
  };

  const addTickerItem = async () => {
    if(!newTicker) return;
    const newItems = [newTicker, ...tickerItems];
    // Use correct path settings/config
    await setDoc(doc(db, 'artifacts', appCollectionId, 'public', 'data', 'settings', 'config'), { ticker: newItems }, { merge: true });
    setNewTicker("");
  };

  const generateAITicker = async () => {
    // Mock AI Generation
    const topics = [
      "AI: Google Gemini 3.0 surpasses human coding ability",
      "TECH: Quantum Internet prototype successful in Netherlands",
      "SPACE: SpaceX Starship lands on Mars (Simulation)",
      "AUTO: Tesla unveils Model 2 with full autonomy",
      "CYBER: New encryption standard post-quantum released"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    setNewTicker(randomTopic);
  };

  const addIssue = async () => {
    await addDoc(collection(db, 'artifacts', appCollectionId, 'public', 'data', 'issues'), {
        ...newIssue,
        number: parseInt(newIssue.number),
        createdAt: serverTimestamp()
    });
    setNewIssue({ title: '', month: '', image: '', number: '' });
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center mb-4 md:mb-0">
            <Shield className="mr-3 text-purple-600" size={32} /> Admin Command Center
          </h1>
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {['overview', 'content', 'approvals', 'issues', 'settings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
             <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <div className="opacity-80 mb-2 font-bold text-sm uppercase">Pending Approvals</div>
                <div className="text-4xl font-bold">{pendingPosts.length}</div>
             </div>
             <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                <div className="opacity-80 mb-2 font-bold text-sm uppercase">Active Tickers</div>
                <div className="text-4xl font-bold">{tickerItems.length}</div>
             </div>
             <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                <div className="opacity-80 mb-2 font-bold text-sm uppercase">Total Issues</div>
                <div className="text-4xl font-bold">{issues.length}</div>
             </div>
             <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg">
                <div className="opacity-80 mb-2 font-bold text-sm uppercase">Admin Users</div>
                <div className="text-4xl font-bold">1</div>
             </div>
          </div>
        )}

        {activeTab === 'content' && <ContentEditor theme={theme} user={user} mode="admin" />}

        {activeTab === 'approvals' && (
          <div className="space-y-4">
             <h2 className="text-xl font-bold mb-4">Review Queue</h2>
             {pendingPosts.length === 0 ? (
                <div className="p-12 text-center opacity-50 border-2 dashed rounded-xl border-gray-300">No pending posts.</div>
             ) : (
               pendingPosts.map(post => (
                 <div key={post.id} className={`p-6 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                    <div className="mb-4 md:mb-0">
                       <h3 className="font-bold text-lg">{post.title}</h3>
                       <div className="flex items-center text-sm opacity-60 space-x-4 mt-1">
                          <span>By {post.author}</span>
                          <span>Category: {post.category}</span>
                       </div>
                       {/* Defensive rendering for content */}
                       <p className="mt-2 text-sm opacity-80 line-clamp-2 max-w-2xl">{typeof post.content === 'string' ? post.content : ''}</p>
                    </div>
                    <div className="flex space-x-3">
                       <Button variant="danger" onClick={() => rejectPost(post.id)}><XCircle size={18} className="mr-2" /> Reject</Button>
                       <Button variant="success" onClick={() => approvePost(post)}><CheckCircle size={18} className="mr-2" /> Publish</Button>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab === 'issues' && (
           <div className="grid md:grid-cols-2 gap-8">
              <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
                 <h3 className="font-bold text-lg mb-4">Add New Issue</h3>
                 <div className="space-y-4">
                    <Input label="Issue Title" value={newIssue.title} onChange={e => setNewIssue({...newIssue, title: e.target.value})} placeholder="e.g. Code & Verse" />
                    <Input label="Month/Year" value={newIssue.month} onChange={e => setNewIssue({...newIssue, month: e.target.value})} placeholder="December 2025" />
                    <Input label="Issue Number" type="number" value={newIssue.number} onChange={e => setNewIssue({...newIssue, number: e.target.value})} placeholder="3" />
                    <Input label="Cover Image URL" value={newIssue.image} onChange={e => setNewIssue({...newIssue, image: e.target.value})} placeholder="https://..." />
                    <Button onClick={addIssue} className="w-full">Upload Issue</Button>
                 </div>
              </div>
              <div className="space-y-4">
                 <h3 className="font-bold text-lg">Published Issues</h3>
                 {issues.map(issue => (
                    <div key={issue.id} className="flex items-center p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                       <div className="w-12 h-16 bg-gray-200 rounded mr-4 overflow-hidden">
                          {issue.image ? <img src={issue.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">PDF</div>}
                       </div>
                       <div>
                          <div className="font-bold">#{issue.number} {issue.title}</div>
                          <div className="text-xs opacity-60">{issue.month}</div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
          <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
             <h3 className="font-bold text-lg mb-4 flex items-center">
               <TrendingUp size={20} className="mr-2 text-blue-500" /> News Ticker Management
             </h3>
             <div className="flex gap-4 mb-6">
                <input 
                  className={`flex-1 p-3 rounded-lg border outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}
                  placeholder="Enter news headline..."
                  value={newTicker}
                  onChange={e => setNewTicker(e.target.value)}
                />
                <Button onClick={generateAITicker} variant="outline" title="Generate with AI">
                  <Cpu size={20} />
                </Button>
                <Button onClick={addTickerItem}>Add</Button>
             </div>
             <div className="space-y-2">
                {tickerItems.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 rounded bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                      {/* Defensive rendering for ticker items */}
                      <span className="text-sm font-medium">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                      <button className="text-red-400 hover:text-red-500"><Trash2 size={16} /></button>
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 5. Public Components (Hero, Archive, Feed)
const Hero = ({ theme, setView }) => (
  <div className={`relative overflow-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
    {/* Animated Background */}
    <div className="absolute inset-0 z-0">
       <div className={`absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-300'}`}></div>
       <div className={`absolute top-60 -left-20 w-72 h-72 rounded-full blur-3xl opacity-30 ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-300'}`}></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 md:py-32 flex flex-col md:flex-row items-center">
      <div className="md:w-1/2 mb-12 md:mb-0 text-center md:text-left">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100 dark:border-slate-700 animate-fade-in-up">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          Issue #3 Released
        </div>
        <h1 className={`text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          Where <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Code</span> <br/>Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">Verse</span>
        </h1>
        <p className={`text-lg md:text-xl mb-10 max-w-lg mx-auto md:mx-0 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
          The official digital portal for JNU x CollegeDekho's Mindverse. Exploring the frontiers of AI, Science, and Student Creativity.
        </p>
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
          <Button onClick={() => setView('archive')} className="px-8 py-4 text-lg shadow-blue-500/30">
            <BookOpen className="mr-2 h-5 w-5" /> Read Magazine
          </Button>
          <Button onClick={() => setView('playground')} variant="outline" className="px-8 py-4 text-lg">
            <Terminal className="mr-2 h-5 w-5" /> Code Lab
          </Button>
        </div>
      </div>
      
      {/* 3D Mockup */}
      <div className="md:w-1/2 flex justify-center perspective-1000">
        <div className="relative w-72 h-[450px] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-r-2xl rounded-l-md shadow-2xl transform rotate-y-minus-12 transition duration-500 hover:rotate-0 hover:scale-105 cursor-pointer group border-r-8 border-white/10">
           {/* Magazine Content */}
           <div className="absolute inset-0 flex flex-col items-center justify-between p-8 text-white">
              <div className="text-center">
                <Cpu className="h-20 w-20 mb-4 opacity-90 mx-auto" />
                <h2 className="text-4xl font-black tracking-tighter">MINDVERSE</h2>
                <div className="h-1 w-20 bg-white/50 mx-auto mt-4 rounded-full"></div>
              </div>
              <div className="text-center">
                 <p className="text-lg font-bold tracking-widest uppercase mb-1">Dec 2025</p>
                 <p className="text-xs opacity-70">Issue #03 | Code & Verse</p>
              </div>
           </div>
           {/* Spine Highlight */}
           <div className="absolute top-0 bottom-0 left-0 w-6 bg-gradient-to-r from-black/20 to-transparent rounded-l-md"></div>
           {/* Gloss */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
        </div>
      </div>
    </div>
  </div>
);

const Archive = ({ theme, user }) => {
  const [issues, setIssues] = useState([]);
  
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appCollectionId, 'public', 'data', 'issues'), orderBy('number', 'desc'));
    const unsubscribe = onSnapshot(q, snap => setIssues(snap.docs.map(d => ({id: d.id, ...d.data()}))), err => console.error("Archive error", err));
    return () => unsubscribe();
  }, [user]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-16 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <h2 className="text-4xl font-bold mb-12 text-center">Magazine Archive</h2>
      <div className="grid md:grid-cols-3 gap-10">
        {issues.length > 0 ? issues.map(issue => (
          <div key={issue.id} className="group cursor-pointer perspective-1000">
            <div className={`relative aspect-[3/4] rounded-xl shadow-xl mb-6 transition transform group-hover:-translate-y-4 duration-500 overflow-hidden ${!issue.image ? 'bg-gradient-to-br from-gray-700 to-gray-900' : ''}`}>
               {issue.image ? (
                 <img src={issue.image} className="w-full h-full object-cover" alt={issue.title} />
               ) : (
                 <div className="flex items-center justify-center h-full text-white flex-col p-8 bg-gradient-to-br from-indigo-600 to-purple-700">
                    <Cpu size={64} className="mb-4 opacity-50" />
                    <h3 className="text-3xl font-bold text-center leading-tight">{issue.title}</h3>
                    <div className="mt-4 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{issue.month}</div>
                 </div>
               )}
               {/* Overlay */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Button variant="secondary" className="scale-90 group-hover:scale-100 transition"><BookOpen size={18} className="mr-2"/> Read Now</Button>
               </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-xl">{issue.title}</h3>
              <p className="text-sm opacity-60">Issue #{issue.number} • {issue.month}</p>
            </div>
          </div>
        )) : (
           <div className="col-span-3 text-center opacity-50">Loading archives...</div>
        )}
      </div>
    </div>
  );
};

const ArticleFeed = ({ theme, user }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appCollectionId, 'public', 'data', 'articles'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, snap => setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() }))), err => console.error("ArticleFeed error", err));
    return () => unsubscribe();
  }, [user]);

  return (
    <div className={`max-w-7xl mx-auto px-4 py-20 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center justify-between mb-12">
         <h2 className="text-4xl font-bold">Latest Stories</h2>
         <Button variant="outline" onClick={() => {}} className="hidden md:flex">View All Posts</Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
         {articles.map(article => (
           <div key={article.id} className={`flex flex-col rounded-2xl overflow-hidden border transition duration-300 hover:shadow-xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-blue-500/30' : 'bg-white border-gray-100 shadow-sm hover:shadow-lg'}`}>
              <div className="h-48 bg-gray-200 dark:bg-slate-700 overflow-hidden relative">
                 {article.image ? (
                   <img src={article.image} className="w-full h-full object-cover transition duration-500 hover:scale-110" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-slate-700 dark:to-slate-600">
                      <ImageIcon className="opacity-20 w-12 h-12 text-slate-500" />
                   </div>
                 )}
                 <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold rounded-full text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {article.category}
                    </span>
                 </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                 <h3 className="text-xl font-bold mb-3 leading-snug hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer">{article.title}</h3>
                 {/* Defensive rendering to allow only strings as children */}
                 <p className="opacity-70 text-sm mb-4 line-clamp-3 flex-1">{typeof article.content === 'string' ? article.content : ''}</p>
                 <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
                    <div className="flex items-center">
                       <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 mr-2"></div>
                       <span className="text-xs font-bold opacity-80">{article.author?.split('@')[0]}</span>
                    </div>
                    <Share2 size={16} className="opacity-40 hover:opacity-100 cursor-pointer" />
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const NewsTicker = ({ theme, user }) => {
  const [news, setNews] = useState([]);
  
  useEffect(() => {
    if (!user) return;
    // Use correct path settings/config
    const unsubscribe = onSnapshot(doc(db, 'artifacts', appCollectionId, 'public', 'data', 'settings', 'config'), d => {
       if (d.exists()) setNews(d.data().ticker || []);
    }, err => console.error("Ticker error", err));
    return () => unsubscribe();
  }, [user]);

  if (news.length === 0) return null;

  return (
    <div className={`py-3 overflow-hidden relative border-b ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-blue-600 border-blue-700 text-white'}`}>
      <div className="absolute left-0 top-0 bottom-0 z-10 px-4 flex items-center font-black text-xs uppercase tracking-widest bg-inherit shadow-lg">
        <TrendingUp size={14} className="mr-2" /> Live
      </div>
      <div className="whitespace-nowrap animate-marquee flex items-center pl-32">
        {news.map((item, idx) => (
          <span key={idx} className="mx-8 text-sm font-semibold flex items-center">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-3 animate-pulse"></span>
            {/* Defensive rendering for ticker */}
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 60s linear infinite; }
      `}</style>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [view, setView] = useState('home');
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null); // Add error state

  useEffect(() => {
    // Check local theme preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');

    const initAuth = async () => {
      try {
         // Always fallback to anonymous sign-in to ensure DB access works for guests
         await signInAnonymously(auth);
      } catch (err) {
         console.error("Authentication Error:", err);
         if (err.code === 'auth/configuration-not-found' || err.code === 'auth/admin-restricted-operation') {
             setAuthError("Firebase Authentication is not enabled. Please go to Firebase Console -> Authentication -> Sign-in method and enable 'Anonymous' and 'Email/Password'.");
         } else {
             setAuthError(`Authentication failed: ${err.message}`);
         }
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
        setUser(u);
        if(u) setAuthError(null); // Clear error on success
    });
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const renderContent = () => {
    switch(view) {
      case 'home': return <><Hero theme={theme} setView={setView} /><ArticleFeed theme={theme} user={user} /></>;
      case 'archive': return <Archive theme={theme} user={user} />;
      case 'auth': return <AuthModal theme={theme} onLogin={() => setView('home')} />;
      case 'write': return user ? <ContentEditor theme={theme} user={user} mode="guest" /> : <AuthModal theme={theme} onLogin={() => setView('write')} />;
      case 'admin': return user ? <AdminPanel theme={theme} user={user} /> : <AuthModal theme={theme} onLogin={() => setView('admin')} />;
      // ... Add Team and Playground components if needed, keeping it concise for this prompt
      default: return <Hero theme={theme} setView={setView} />;
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Error Banner */}
      {authError && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold animate-pulse">
           CRITICAL: {authError}
        </div>
      )}
      <NewsTicker theme={theme} user={user} />
      <Navbar view={view} setView={setView} toggleTheme={toggleTheme} theme={theme} user={user} onLogout={() => signOut(auth)} />
      <main>{renderContent()}</main>
    </div>
  );
}