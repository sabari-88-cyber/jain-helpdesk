import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LiquidBackground from './components/LiquidBackground';
import RequestForm from './components/RequestForm';
import TrackRequest from './components/TrackRequest';
import MyRequests from './components/MyRequests';
import AllRequests from './components/AllRequests';
import SubmitSuccessModal from './components/SubmitSuccessModal';
import RequestDetailModal from './components/RequestDetailModal';
import StaffNoteModal from './components/StaffNoteModal';
import StaffPinModal from './components/StaffPinModal';
import FeedbackModal from './components/FeedbackModal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import OnboardingTour from './components/OnboardingTour';
import Toast from './components/Toast';
import MurmurationWordmark from './components/ui/murmuration-wordmark';
import { db } from './lib/db';
import { 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  Maximize2, 
  Minus, 
  X,
  Compass
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'submit' | 'track' | 'my-requests'
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('campus_user_role') || 'student';
  });

  const [dbMode, setDbMode] = useState(() => db.getMode());
  const [myTicketCount, setMyTicketCount] = useState(0);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('campus_dark_mode') === 'true';
  });

  // Font Size: 'sm' | 'base' | 'lg'
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('campus_font_size') || 'base';
  });

  // Murmuration Wordmark Hero Header toggle
  const [showMurmuration, setShowMurmuration] = useState(true);

  // Modals state
  const [submitSuccessRequest, setSubmitSuccessRequest] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [staffNoteRequest, setStaffNoteRequest] = useState(null);
  const [feedbackRequest, setFeedbackRequest] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [trackSearchTarget, setTrackSearchTarget] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (toastObj) => {
    setToast(toastObj);
    setTimeout(() => {
      setToast(current => (current === toastObj ? null : current));
    }, 4500);
  };

  // Sync dark mode class on document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('campus_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('campus_dark_mode', 'false');
    }
  }, [darkMode]);

  // Sync font size scale on root
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'sm') root.style.setProperty('--text-scale', '0.92rem');
    else if (fontSize === 'lg') root.style.setProperty('--text-scale', '1.08rem');
    else root.style.setProperty('--text-scale', '1rem');
    localStorage.setItem('campus_font_size', fontSize);
  }, [fontSize]);

  const refreshTicketCount = () => {
    setMyTicketCount(db.getMyTickets().length);
    setDbMode(db.getMode());
  };

  useEffect(() => {
    refreshTicketCount();
  }, [activeTab]);

  // Staff switch with PIN verification
  const handleStaffClick = () => {
    if (userRole === 'staff') return;
    const isUnlocked = localStorage.getItem('campus_staff_unlocked') === 'true';
    if (isUnlocked) {
      setUserRole('staff');
      localStorage.setItem('campus_user_role', 'staff');
      showToast({ type: 'info', message: 'Switched to Staff Portal' });
    } else {
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = () => {
    setIsPinModalOpen(false);
    setUserRole('staff');
    localStorage.setItem('campus_user_role', 'staff');
    localStorage.setItem('campus_staff_unlocked', 'true');
    showToast({ type: 'success', message: 'Staff Access Unlocked!' });
  };

  const handleStudentClick = () => {
    setUserRole('student');
    localStorage.setItem('campus_user_role', 'student');
    showToast({ type: 'info', message: 'Switched to Student Helpdesk View' });
  };

  const handleTicketSubmitted = (newRequest) => {
    setSubmitSuccessRequest(newRequest);
    refreshTicketCount();
  };

  const handleTrackFromSuccess = (ticketId) => {
    setSubmitSuccessRequest(null);
    setTrackSearchTarget(ticketId);
    setActiveTab('track');
  };

  return (
    <div className={`min-h-screen relative flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-liquid-dark text-slate-100' : 'bg-liquid-light text-slate-900'
    }`}>
      
      {/* 5-6 Liquid Blobs Background with Morphing Animations */}
      <LiquidBackground />

      {/* Top Glass Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        onStaffSwitchClick={handleStaffClick}
        onStudentSwitchClick={handleStudentClick}
        dbMode={dbMode}
        openSqlModal={() => setIsSqlModalOpen(true)}
        myTicketCount={myTicketCount}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
        
        {/* ==============================================================================
            JAIN HELPDESK - MURMURATION WORDMARK SHOWCASE
            Thousands of starlings over a dusk sky that flock and converge into "JAIN HELPDESK",
            with the pointer acting as a hawk that scatters them.
            ============================================================================== */}
        <section aria-label="JAIN HELPDESK Hero" className="rounded-3xl overflow-hidden shadow-2xl relative border border-white/50 dark:border-white/15" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px) saturate(140%)' }}>

          {/* ── BOLD TITLE BLOCK ─────────────────────────────────────── */}
          <div className="px-6 pt-7 pb-5 text-center relative"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,240,200,0.18) 100%)' }}
          >
            {/* Main title */}
            <h1
              className="leading-none tracking-widest uppercase"
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontSize: 'clamp(2.4rem, 7vw, 5.5rem)',
                fontWeight: 900,
                letterSpacing: '0.12em',
                background: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 35%, #ea580c 60%, #fed7aa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 12px rgba(194,65,12,0.35))',
              }}
            >
              JAIN HELPDESK
            </h1>

            {/* Subtitle */}
            <p
              className="mt-2 font-semibold uppercase"
              style={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontSize: 'clamp(0.6rem, 1.6vw, 0.85rem)',
                letterSpacing: '0.28em',
                color: '#92400e',
              }}
            >
              Campus Facilities &amp; Student Support Portal
            </p>

            {/* Decorative divider line */}
            <div className="mt-4 mx-auto h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ea580c, transparent)' }} />

            {/* Top-right controls */}
            <div className="absolute top-3 right-4 flex items-center gap-2">
              <button
                onClick={() => setShowMurmuration(!showMurmuration)}
                className="text-orange-900 dark:text-orange-200 hover:text-black dark:hover:text-white px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1"
                style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}
                title={showMurmuration ? "Hide bird flock" : "Show bird flock"}
              >
                🦅 {showMurmuration ? 'Hide Flock' : 'Show Flock'}
              </button>
            </div>
          </div>

          {/* ── BIRD CANVAS (pure — zero text inside) ────────────────── */}
          {showMurmuration && (
            <div className="relative w-full h-[220px] sm:h-[300px] overflow-hidden" style={{ background: '#1c2538' }}>
              <MurmurationWordmark
                word="JAIN HELPDESK"
                height="100%"
                preset="dusk"
                birds={4200}
                flyFor={1.5}
                holdFor={7.0}
                interactive={true}
              />
              {/* tiny pointer hint — bottom-right, minimal footprint */}
              <div className="absolute bottom-3 right-4 pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/70 text-[10px] font-semibold border border-white/10 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400/80" />
                  Hover to scatter
                </span>
              </div>
            </div>
          )}
        </section>


        {/* ==============================================================================
            MAIN FLOATING GLASS WINDOW (Browser Window Style)
            ============================================================================== */}
        <div className="glass-window rounded-3xl p-4 sm:p-8 shadow-2xl relative">
          
          {/* Subtle Window Top Bar / Status */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/40 dark:border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Portal Location:
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/60 dark:bg-slate-800/80 font-mono font-bold text-slate-900 dark:text-white border border-white/50">
                {activeTab === 'all' ? 'All Campus Requests' : activeTab === 'submit' ? 'Submit Issue Wizard' : activeTab === 'track' ? 'Live Progress Tracker' : 'My Device Tickets'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300 font-semibold">
              <span className="hidden sm:inline">Theme:</span>
              <span className="font-bold">Liquid Glass</span>
            </div>
          </div>

          {/* Active Tab Views */}
          {activeTab === 'submit' && (
            <RequestForm
              onSuccess={handleTicketSubmitted}
              onTrackExisting={(tId) => {
                setTrackSearchTarget(tId);
                setActiveTab('track');
              }}
              showToast={showToast}
            />
          )}

          {activeTab === 'track' && (
            <TrackRequest
              initialTicketId={trackSearchTarget}
              onSelectTicket={(tId) => setSelectedTicketId(tId)}
              userRole={userRole}
              showToast={showToast}
              onOpenStaffNoteModal={(req) => setStaffNoteRequest(req)}
              onOpenFeedbackModal={(req) => setFeedbackRequest(req)}
            />
          )}

          {activeTab === 'my-requests' && (
            <MyRequests
              onTrackTicket={(tId) => {
                setTrackSearchTarget(tId);
                setActiveTab('track');
              }}
              onNewRequest={() => setActiveTab('submit')}
              showToast={showToast}
            />
          )}

          {activeTab === 'all' && (
            <AllRequests
              userRole={userRole}
              onSelectTicket={(tId) => setSelectedTicketId(tId)}
              onNewRequest={() => setActiveTab('submit')}
              showToast={showToast}
              onOpenStaffNoteModal={(req) => setStaffNoteRequest(req)}
            />
          )}

        </div>

      </main>

      {/* Frosted Glass Footer */}
      <footer className="mt-auto px-4 sm:px-6 py-6 text-xs text-slate-800 dark:text-slate-300">
        <div className="max-w-7xl mx-auto glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 font-medium">
            <span
              className="font-bold text-sm text-slate-900 dark:text-white"
              style={{ fontFamily: '"Playfair Display", Georgia, serif', letterSpacing: '0.06em' }}
            >
              JAIN HELPDESK
            </span>
            <span>• Facilities & Campus Operations</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="underline font-bold text-slate-900 dark:text-white hover:text-emerald-800"
            >
              Supabase SQL Schema & Credentials
            </button>
            <span>•</span>
            <span>Mode: <strong className={dbMode.type === 'supabase' ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}>{dbMode.type === 'supabase' ? 'Supabase Live' : 'LocalStorage Fallback'}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {submitSuccessRequest && (
        <SubmitSuccessModal
          request={submitSuccessRequest}
          onClose={() => setSubmitSuccessRequest(null)}
          onTrackRequest={handleTrackFromSuccess}
          onNewRequest={() => {
            setSubmitSuccessRequest(null);
            setActiveTab('submit');
          }}
        />
      )}

      {selectedTicketId && (
        <RequestDetailModal
          ticketId={selectedTicketId}
          onClose={() => setSelectedTicketId(null)}
          userRole={userRole}
          showToast={showToast}
          onUpdated={refreshTicketCount}
        />
      )}

      {staffNoteRequest && (
        <StaffNoteModal
          request={staffNoteRequest}
          onClose={() => setStaffNoteRequest(null)}
          onUpdated={refreshTicketCount}
          showToast={showToast}
        />
      )}

      {feedbackRequest && (
        <FeedbackModal
          request={feedbackRequest}
          isOpen={!!feedbackRequest}
          onClose={() => setFeedbackRequest(null)}
          onUpdated={refreshTicketCount}
          showToast={showToast}
        />
      )}

      <StaffPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      <SupabaseConfigModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
        dbMode={dbMode}
        onModeChanged={() => setDbMode(db.getMode())}
        showToast={showToast}
      />

      {/* Onboarding Tour Tooltip for New Students */}
      <OnboardingTour />

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
