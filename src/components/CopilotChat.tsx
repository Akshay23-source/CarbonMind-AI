import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Bot, X, Send, Mic, MicOff, Volume2, VolumeX,
  Search, Settings, FileText, Award, Globe, Heart, Sun, Thermometer,
  Shield, CheckCircle2, RefreshCw, AlertCircle, Compass, HelpCircle, Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiService, ChatMessage } from '../services/ai';
import { Button } from './Button';
import { Badge } from './Badge';

interface CopilotChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
}

// Multi-language translation dictionary for Copilot UI
const TRANSLATIONS: Record<string, any> = {
  English: {
    title: 'CarbonMind Copilot',
    subtitle: 'Sustainability AI OS',
    tabChat: 'Chat',
    tabSearch: 'Search',
    tabReports: 'Reports',
    tabIQ: 'IQ Simulator',
    tabSettings: 'Settings',
    placeholder: 'Ask me anything about sustainability...',
    listening: 'Listening...',
    quickSuggest: 'Quick suggestions',
    searchPlaceholder: 'Search receipts, meals, travel...',
    reportPlaceholder: 'Select report range',
    settingsLanguage: 'Language',
    settingsPersonality: 'AI Personality',
    settingsAlerts: 'Alert Frequency',
    settingsVoice: 'Voice Gender',
    ecoScore: 'EcoScore',
    iqScore: 'Sustainability IQ',
    weather: 'Sunny',
    twinStatus: 'Planet Guardian'
  },
  Hindi: {
    title: 'कार्बनमाइंड कोपायलट',
    subtitle: 'स्थिरता एआई ओएस',
    tabChat: 'चैट',
    tabSearch: 'खोजें',
    tabReports: 'रिपोर्ट',
    tabIQ: 'आईक्यू सिम्युलेटर',
    tabSettings: 'सेटिंग्स',
    placeholder: 'स्थिरता के बारे में कुछ भी पूछें...',
    listening: 'सुन रहा हूँ...',
    quickSuggest: 'त्वरित सुझाव',
    searchPlaceholder: 'रसीद, भोजन, यात्रा खोजें...',
    reportPlaceholder: 'रिपोर्ट अवधि चुनें',
    settingsLanguage: 'भाषा',
    settingsPersonality: 'एआई व्यक्तित्व',
    settingsAlerts: 'अलर्ट आवृत्ति',
    settingsVoice: 'आवाज लिंग',
    ecoScore: 'इकोस्कोर',
    iqScore: 'सस्टेनेबिलिटी आईक्यू',
    weather: 'धूपदार',
    twinStatus: 'ग्रह रक्षक'
  },
  Kannada: {
    title: 'ಕಾರ್ಬನ್‌ಮೈಂಡ್ ಕೊಪೈಲಟ್',
    subtitle: 'ಸಸ್ಟೈನಬಿಲಿಟಿ ಎಐ ಒಎಸ್',
    tabChat: 'ಚಾಟ್',
    tabSearch: 'ಹುಡುಕು',
    tabReports: 'ವರದಿಗಳು',
    tabIQ: 'ಐಕ್ಯೂ ಸಿಮ್ಯುಲೇಟರ್',
    tabSettings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    placeholder: 'ಸುಸ್ಥಿರತೆಯ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿರುವೆ...',
    quickSuggest: 'ತ್ವರಿತ ಸಲಹೆಗಳು',
    searchPlaceholder: 'ರಸೀದಿಗಳು, ಊಟ, ಪ್ರಯಾಣ ಹುಡುಕಿ...',
    reportPlaceholder: 'ವರದಿ ವ್ಯಾಪ್ತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    settingsLanguage: 'ಭಾಷೆ',
    settingsPersonality: 'ಎಐ ವ್ಯಕ್ತಿತ್ವ',
    settingsAlerts: 'ಎಚ್ಚರಿಕೆ ಆವರ್ತನ',
    settingsVoice: 'ಧ್ವನಿ ಲಿಂಗ',
    ecoScore: 'ಇಕೋಸ್ಕೋರ್',
    iqScore: 'ಸಸ್ಟೈನಬಿಲಿಟಿ ಐಕ್ಯೂ',
    weather: 'ಬಿಸಿಲು',
    twinStatus: 'ಗ್ರಹ ರಕ್ಷಕ'
  },
  Tamil: {
    title: 'கார்பன்மைண்ட் கோபைலட்',
    subtitle: 'நிலைத்தன்மை AI OS',
    tabChat: 'அரட்டை',
    tabSearch: 'தேடு',
    tabReports: 'அறிக்கைகள்',
    tabIQ: 'ஐக்யூ சிமுலேட்டர்',
    tabSettings: 'அமைப்புகள்',
    placeholder: 'நிலைத்தன்மை பற்றி எதையும் கேளுங்கள்...',
    listening: 'கேட்கிறது...',
    quickSuggest: 'விரைவான பரிந்துரைகள்',
    searchPlaceholder: 'ரசீதுகள், உணவு, பயணம் தேடு...',
    reportPlaceholder: 'அறிக்கை வரம்பைத் தேர்ந்தெடுக்கவும்',
    settingsLanguage: 'மொழி',
    settingsPersonality: 'AI ஆளுமை',
    settingsAlerts: 'எச்சரிக்கை அதிர்வெண்',
    settingsVoice: 'குரல் பாலினம்',
    ecoScore: 'ஈகோஸ்கோர்',
    iqScore: 'நிலைத்தன்மை ஐக்யூ',
    weather: 'வெயில்',
    twinStatus: 'பூமி பாதுகாவலர்'
  },
  Telugu: {
    title: 'కార్బన్‌మైండ్ కోపైలట్',
    subtitle: 'సస్టైనబిలిటీ AI OS',
    tabChat: 'చాట్',
    tabSearch: 'వెతకండి',
    tabReports: 'నివేదికలు',
    tabIQ: 'ఐక్యూ సిమ్యులేటర్',
    tabSettings: 'సెట్టింగులు',
    placeholder: 'సుస్థಿರత గురించి ఏదైనా అడగండి...',
    listening: 'వింటున్నాను...',
    quickSuggest: 'త్వరిత సూచనలు',
    searchPlaceholder: 'రశీదులు, భోజనం, ప్రయాణం వెతకండి...',
    reportPlaceholder: 'నివేదిక పరిధిని ఎంచుకోండి',
    settingsLanguage: 'భాష',
    settingsPersonality: 'AI వ్యక్తిత్వం',
    settingsAlerts: 'హెచ్చరిక ఫ్రీక్వెన్సీ',
    settingsVoice: 'వాయిస్ జెండర్',
    ecoScore: 'ఇకోస్కోర్',
    iqScore: 'సస్టైనబిలిటీ ఐక్యూ',
    weather: 'ఎండగా',
    twinStatus: 'గ్రహ రక్షకుడు'
  },
  Malayalam: {
    title: 'കാർബൺമൈൻഡ് കോപൈലറ്റ്',
    subtitle: 'സുസ്ഥിരത AI OS',
    tabChat: 'ചാറ്റ്',
    tabSearch: 'തിരയുക',
    tabReports: 'റിപ്പോർട്ടുകൾ',
    tabIQ: 'ഐക്യൂ സിമുലേറ്റർ',
    tabSettings: 'ക്രമീകരണങ്ങൾ',
    placeholder: 'സുസ്ഥിരതയെക്കുറിച്ച് എന്തും ചോദിക്കാം...',
    listening: 'കേൾക്കുന്നു...',
    quickSuggest: 'ദ്രുത നിർദ്ദേശങ്ങൾ',
    searchPlaceholder: 'രസീതുകൾ, ഭക്ഷണം, യാത്ര തിരയുക...',
    reportPlaceholder: 'റിപ്പോർട്ട് പരിധി തിരഞ്ഞെടുക്കുക',
    settingsLanguage: 'ഭാഷ',
    settingsPersonality: 'AI വ്യക്തിത്വം',
    settingsAlerts: 'അലേർട്ട് ആവൃത്തി',
    settingsVoice: 'വോയ്‌സ് ലിംഗഭേദം',
    ecoScore: 'ഇക്കോസ്കോർ',
    iqScore: 'സുസ്ഥിരത ഐക്യൂ',
    weather: 'വെയിൽ',
    twinStatus: 'ഭൂമി സംരക്ഷകൻ'
  }
};

export const CopilotChat: React.FC<CopilotChatProps> = ({
  isOpen,
  onClose,
  currentPage
}) => {
  const { user } = useAuth();
  
  // Settings State variables
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('copilot_language') || 'English');
  const [personality, setPersonality] = useState<string>(() => localStorage.getItem('copilot_personality') || 'Friendly');
  const [voiceGender, setVoiceGender] = useState<string>(() => localStorage.getItem('copilot_voice') || 'Female');
  const [alertFreq, setAlertFreq] = useState<string>(() => localStorage.getItem('copilot_alerts') || 'Medium');

  const text = TRANSLATIONS[language] || TRANSLATIONS['English'];

  // Cache settings changes
  useEffect(() => {
    localStorage.setItem('copilot_language', language);
    localStorage.setItem('copilot_personality', personality);
    localStorage.setItem('copilot_voice', voiceGender);
    localStorage.setItem('copilot_alerts', alertFreq);
  }, [language, personality, voiceGender, alertFreq]);

  // Tab control state
  const [activeTab, setActiveTab] = useState<'chat' | 'search' | 'reports' | 'iq' | 'settings'>('chat');

  // Dialogue messaging state
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const cached = localStorage.getItem('copilot_chat_history');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        // Fallback below
      }
    }
    return [
      {
        role: 'model',
        content: 'Hello! I am CarbonMind Copilot. I analyze your carbon twin, search receipts, audit utility bills, and suggest greener actions. How can I help you reduce emissions today?'
      }
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Search tab state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Reports tab state
  const [reportRange, setReportRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');
  const [reportMarkdown, setReportMarkdown] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Sustainability IQ & Earth 2050 Simulator states
  const baseScore = user?.ecoScore || 75;
  const sustainabilityIQ = Math.min(100, Math.max(0, Math.round(baseScore * 1.08)));
  const [simulatorScore, setSimulatorScore] = useState(baseScore);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Save chat logs
  useEffect(() => {
    localStorage.setItem('copilot_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Speech Recognition hook initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language === 'English' ? 'en-US' :
                 language === 'Hindi' ? 'hi-IN' :
                 language === 'Tamil' ? 'ta-IN' :
                 language === 'Telugu' ? 'te-IN' :
                 language === 'Kannada' ? 'kn-IN' : 'ml-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputVal(prev => prev + ' ' + transcript);
        }
      };
      recognitionRef.current = rec;
    }
  }, [language]);

  // Text-To-Speech reader
  const speakText = (phrase: string) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop active voices
    
    // Simple markdown cleaner
    const cleanStr = phrase.replace(/[*#`_\-]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanStr);
    
    // Choose speech language
    utterance.lang = language === 'English' ? 'en-US' :
                     language === 'Hindi' ? 'hi-IN' :
                     language === 'Tamil' ? 'ta-IN' :
                     language === 'Telugu' ? 'te-IN' :
                     language === 'Kannada' ? 'kn-IN' : 'ml-IN';

    // Filter voice gender
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => {
      const lowerName = v.name.toLowerCase();
      const matchLang = v.lang.startsWith(utterance.lang.substring(0, 2));
      if (voiceGender === 'Female') {
        return matchLang && (lowerName.includes('female') || lowerName.includes('zira') || lowerName.includes('google') || lowerName.includes('samantha'));
      } else {
        return matchLang && (lowerName.includes('male') || lowerName.includes('david') || lowerName.includes('ravi') || lowerName.includes('microsoft'));
      }
    });

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  const toggleSpeech = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  // Submit chat question
  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputVal.trim();
    if (!q) return;

    if (!queryText) setInputVal('');

    const newUserMsg: ChatMessage = { role: 'user', content: q };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    try {
      const contextObj = {
        currentPage,
        location: 'San Francisco',
        personality: personality,
        language: language
      };

      const res = await aiService.getCopilotChat(user, q, messages, contextObj);
      if (res && res.reply) {
        const replyMsg: ChatMessage = { role: 'model', content: res.reply };
        setMessages(prev => [...prev, replyMsg]);
        speakText(res.reply);
      }
    } catch (e) {
      const errorMsg: ChatMessage = { role: 'model', content: 'Connection issue encountered. I am having trouble fetching responses from Gemini servers.' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Quick suggestions trigger
  const SUGGESTIONS = [
    'How can I improve my EcoScore?',
    'Why is my carbon footprint increasing?',
    'Find my highest carbon meal.',
    'Should I install solar panels?',
    'Suggest tomorrow\'s meals.'
  ];

  // Perform search across logs
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await aiService.getCopilotSearch(user, searchQuery);
      if (res.success) {
        setSearchResults(res.results);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Generate md report
  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const res = await aiService.getCopilotReport(user, reportRange);
      if (res.success) {
        setReportMarkdown(res.content);
      }
    } catch (e) {
      setReportMarkdown('Error occurred during report compilation.');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportMarkdown) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const lines = reportMarkdown.split('\n');
    let htmlContent = '';
    let inList = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        if (inList) { htmlContent += '</ul>'; inList = false; }
        htmlContent += `<h1 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px; font-family: sans-serif;">${trimmed.replace('# ', '')}</h1>`;
      } else if (trimmed.startsWith('## ')) {
        if (inList) { htmlContent += '</ul>'; inList = false; }
        htmlContent += `<h2 style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 12px; margin-bottom: 6px; font-family: sans-serif;">${trimmed.replace('## ', '')}</h2>`;
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) { htmlContent += '<ul style="margin: 0 0 10px 0; padding-left: 20px; font-family: sans-serif;">'; inList = true; }
        htmlContent += `<li style="margin-bottom: 4px; font-size: 11.5px; color: #334155; line-height: 1.4;">${trimmed.substring(2)}</li>`;
      } else if (trimmed === '---') {
        if (inList) { htmlContent += '</ul>'; inList = false; }
        htmlContent += `<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;" />`;
      } else if (trimmed === '') {
        // empty line
      } else {
        if (inList) { htmlContent += '</ul>'; inList = false; }
        htmlContent += `<p style="margin: 0 0 8px 0; font-size: 11.5px; color: #334155; line-height: 1.4; font-family: sans-serif;">${trimmed}</p>`;
      }
    });
    if (inList) { htmlContent += '</ul>'; }

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportRange.toUpperCase()} Sustainability Report</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              line-height: 1.4;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              width: 100%;
              box-sizing: border-box;
            }
            .header-bar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #10b981;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .header-bar h1 {
              font-size: 18px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .header-bar .meta {
              text-align: right;
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
            }
            .footer-bar {
              margin-top: 25px;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
              font-size: 9px;
              color: #94a3b8;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="header-bar">
              <div>
                <h1>CarbonMind Copilot Impact Report</h1>
                <div style="font-size: 10px; color: #10b981; font-weight: bold; margin-top: 2px;">
                  Personalized Sustainability Performance Profile
                </div>
              </div>
              <div class="meta">
                <div>User: ${user?.displayName || 'Eco Pioneer'}</div>
                <div>Date: ${new Date().toLocaleDateString()}</div>
                <div>Scope: ${reportRange.toUpperCase()}</div>
              </div>
            </div>
            
            <div class="report-content">
              ${htmlContent}
            </div>
            
            <div class="footer-bar">
              © ${new Date().getFullYear()} CarbonMind AI Platform. All rights reserved. Verified ecological footprint scorecard.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
  };

  // Clear chat log history
  const handleClearHistory = () => {
    if (window.confirm('Delete all messages in Copilot chat logs?')) {
      const initialMsg: ChatMessage = {
        role: 'model',
        content: 'Hello! I am CarbonMind Copilot. I analyze your carbon twin, search receipts, audit utility bills, and suggest greener actions. How can I help you reduce emissions today?'
      };
      setMessages([initialMsg]);
      localStorage.removeItem('copilot_chat_history');
    }
  };

  // Earth 2050 Simulator parameters calculated based on slider value
  const tempIncrease = parseFloat((3.8 - (simulatorScore / 100) * 2.5).toFixed(2));
  const iceCapLevel = Math.round((simulatorScore / 100) * 85);
  const greenCover = Math.round((simulatorScore / 100) * 78);
  let globalRisk = 'High Collapse Threat';
  let riskColor = 'text-red-500';
  if (simulatorScore >= 85) {
    globalRisk = 'Climate Stable Inhabitance';
    riskColor = 'text-emerald-500';
  } else if (simulatorScore >= 65) {
    globalRisk = 'Moderate Heat Vulnerability';
    riskColor = 'text-amber-500';
  }

  // Very simple Markdown rendering helper
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-lg font-black text-slate-800 dark:text-slate-100 mt-4 mb-2 pb-1 border-b border-slate-100 dark:border-zinc-800">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-sm font-black text-slate-850 dark:text-slate-200 mt-3 mb-1.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="list-disc ml-5 text-xs text-slate-600 dark:text-zinc-400 py-0.5 font-sans leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-3 border-slate-150 dark:border-zinc-800" />;
      }
      return <p key={idx} className="text-xs text-slate-650 dark:text-zinc-450 leading-relaxed py-1 font-sans">{line}</p>;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Expandable Slide drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[480px] bg-white/95 dark:bg-zinc-950/95 border-l border-slate-200/60 dark:border-zinc-900/60 z-50 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Header info */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-primary-500/5 to-emerald-500/10 border-b border-slate-200/50 dark:border-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-primary-500 text-white animate-pulse">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 font-sans">
                    {text.title}
                    <Badge variant="premium" size="sm" className="py-0 px-1.5 text-[8px] tracking-wide uppercase font-black bg-emerald-500/20 text-emerald-500 border-none">
                      Active OS
                    </Badge>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 tracking-wide uppercase font-sans">
                    {text.subtitle}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {activeTab === 'chat' && (
                  <button
                    onClick={handleClearHistory}
                    title="Clear Dialogue Logs"
                    className="p-2 rounded-xl text-slate-450 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-450 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Context parameters bar */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-zinc-900/30 text-[10px] text-slate-400 dark:text-zinc-500 flex flex-wrap gap-x-4 gap-y-1.5 items-center justify-between border-b border-slate-100 dark:border-zinc-900/60 font-sans font-bold">
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-sky-500" />
                <span>Page: {currentPage || '/'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sun className="h-3 w-3 text-amber-500" />
                <span>Score: {baseScore} • IQ: {sustainabilityIQ}</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-3 w-3 text-emerald-500" />
                <span>Role: Eco Pioneer</span>
              </div>
            </div>

            {/* View navigation Tabs */}
            <div className="flex bg-slate-50 dark:bg-zinc-950 border-b border-slate-150 dark:border-zinc-900 text-xs font-bold font-sans">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                {text.tabChat}
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'search' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                {text.tabSearch}
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'reports' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                {text.tabReports}
              </button>
              <button
                onClick={() => setActiveTab('iq')}
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'iq' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                {text.tabIQ}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-3 border-b-2 transition-colors ${activeTab === 'settings' ? 'border-primary-500 text-primary-500' : 'border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-slate-100'}`}
              >
                {text.tabSettings}
              </button>
            </div>

            {/* Central panels content block */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* TAB 1: INTERACTIVE DIALOGUE CHAT */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col justify-between">
                  {/* Messages log */}
                  <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1 pb-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-2.5 text-xs text-left ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role !== 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-primary-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                            <Bot className="h-4 w-4" />
                          </div>
                        )}
                        <div
                          className={`p-3 max-w-[85%] rounded-2xl border font-sans leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-primary-500 border-primary-600 text-white rounded-tr-sm text-right'
                              : 'bg-slate-50 border-slate-150 dark:bg-zinc-900/50 dark:border-zinc-800/80 text-slate-750 dark:text-slate-200 rounded-tl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-2.5 text-xs text-left justify-start items-center">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-primary-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-spin">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl rounded-tl-sm border border-slate-150 dark:border-zinc-800/80 flex items-center gap-1 text-slate-400 dark:text-zinc-550 font-bold uppercase tracking-wider text-[10px]">
                          <span>Thinking</span>
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestion & Input box area */}
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-zinc-900/60 bg-white dark:bg-zinc-950 z-10">
                    {/* Quick suggestion tags list */}
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary-500" />
                        {text.quickSuggest}
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {SUGGESTIONS.map((s, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(s)}
                            className="px-2.5 py-1.5 rounded-full text-[10px] font-bold text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 hover:border-primary-500/50 dark:hover:border-primary-500/40 hover:bg-slate-100 dark:hover:bg-zinc-850 transition-all font-sans text-left"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Text Input field */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendMessage();
                          }}
                          placeholder={text.placeholder}
                          className="w-full pl-4 pr-10 py-3 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 focus:border-primary-500 rounded-2xl focus:outline-none text-xs text-slate-800 dark:text-slate-200"
                        />
                        {/* Audio speech microphone button */}
                        <button
                          onClick={toggleSpeech}
                          title="Voice Command Mode"
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-450 hover:bg-slate-100 dark:hover:bg-zinc-850'}`}
                        >
                          {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      
                      {/* TTS speaker trigger button */}
                      <button
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        title="Toggle Text-to-Speech"
                        className={`p-3 rounded-2xl border transition-colors ${ttsEnabled ? 'border-primary-500/30 bg-primary-500/5 text-primary-500' : 'border-slate-150 dark:border-zinc-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900'}`}
                      >
                        {ttsEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
                      </button>

                      {/* Send button */}
                      <Button
                        variant="primary"
                        onClick={() => handleSendMessage()}
                        disabled={!inputVal.trim() && !isListening}
                        className="p-3 h-auto w-auto rounded-2xl flex items-center justify-center"
                      >
                        <Send className="h-4.5 w-4.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORY SEARCH UTILITY */}
              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-550" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearch();
                        }}
                        placeholder={text.searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-xs text-slate-800 dark:text-slate-200 font-sans"
                      />
                    </div>
                    <Button variant="primary" size="sm" onClick={handleSearch} isLoading={isSearching}>
                      Search
                    </Button>
                  </div>

                  {/* Search results list */}
                  <div className="space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((res, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-150 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/20 text-left font-sans space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary-500 px-2 py-0.5 rounded bg-primary-500/10 w-fit">
                              {res.type}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-zinc-550">
                              {res.date}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {res.title}
                          </h4>
                          <p className="text-[10px] text-slate-550 dark:text-zinc-500">
                            {res.detail}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center space-y-2 border border-dashed border-slate-150 dark:border-zinc-800/80 rounded-xl">
                        <HelpCircle className="h-7 w-7 text-slate-350 dark:text-zinc-650 mx-auto" />
                        <p className="text-xs text-slate-450 dark:text-zinc-500 font-sans">
                          {searchQuery ? 'No matched records found.' : 'Search across receipts, meals, travel, energy, challenges, and achievements.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SUSTAINABILITY REPORT GENERATION */}
              {activeTab === 'reports' && (
                <div className="space-y-4 text-left">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/5 to-secondary-500/5 border border-primary-500/10 space-y-3 font-sans">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      Report Builder
                    </h4>
                    <p className="text-[11px] text-slate-450 dark:text-zinc-500 leading-relaxed">
                      AI audits all verified grocery receipts, travel maps, daily metrics, and electricity statements to write a natural language analysis.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={reportRange}
                        onChange={(e: any) => setReportRange(e.target.value)}
                        className="flex-1 bg-white dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 rounded-xl py-2 px-3 focus:outline-none text-xs text-slate-700 dark:text-slate-300 font-sans font-bold"
                      >
                        <option value="daily">Daily audit summary</option>
                        <option value="weekly">Weekly analysis report</option>
                        <option value="monthly">Monthly trend insights</option>
                        <option value="yearly">Yearly projection audit</option>
                      </select>

                      <Button variant="primary" size="sm" onClick={handleGenerateReport} isLoading={loadingReport}>
                        Compile
                      </Button>
                    </div>
                  </div>

                  {/* Render compiled Markdown report */}
                  {reportMarkdown && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                          Compiled Output
                        </span>
                        
                        {/* Print / PDF Trigger */}
                        <Button
                          variant="glass"
                          size="sm"
                          onClick={handleExportPDF}
                          className="h-8 py-1 text-[10px] font-bold flex items-center gap-1.5"
                        >
                          <Download className="h-3 w-3" />
                          PDF Export
                        </Button>
                      </div>

                      <div className="p-4 border border-slate-150 dark:border-zinc-900 bg-slate-50/20 dark:bg-zinc-900/10 rounded-2xl font-sans overflow-x-hidden select-text text-left max-w-full">
                        {renderMarkdown(reportMarkdown)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: IQ & EARTH 2050 SIMULATOR */}
              {activeTab === 'iq' && (
                <div className="space-y-6 text-left">
                  {/* Sustainability IQ Card */}
                  <div className="p-5 rounded-2xl glass-card border border-primary-500/25 relative overflow-hidden flex items-center gap-5 font-sans">
                    <div className="relative w-20 h-20 shrink-0 flex items-center justify-center bg-primary-500/10 rounded-full border border-primary-500/20">
                      {/* Circular Progress Gauge */}
                      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle cx="40" cy="40" r="34" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="6" fill="transparent" />
                        <circle cx="40" cy="40" r="34" className="stroke-primary-500" strokeWidth="6" fill="transparent" strokeDasharray={`${2 * Math.PI * 34}`} strokeDashoffset={`${2 * Math.PI * 34 * (1 - sustainabilityIQ / 100)}`} strokeLinecap="round" />
                      </svg>
                      <span className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {sustainabilityIQ}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase text-primary-500 tracking-wider">
                        Verified Metric
                      </span>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                        {text.iqScore}
                      </h4>
                      <p className="text-[10px] text-slate-450 dark:text-zinc-500 leading-normal">
                        Your IQ matches **Level {user?.level || 1} Pioneer** standing. Earn more badges to raise IQ rating offsets.
                      </p>
                    </div>
                  </div>

                  {/* Earth 2050 Climate Simulator */}
                  <div className="p-5 rounded-2xl border border-slate-150 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/10 space-y-4 font-sans">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-red-500 animate-pulse" />
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        Earth 2050 Climate Simulator
                      </h4>
                    </div>
                    
                    <p className="text-[10px] text-slate-450 dark:text-zinc-500 leading-relaxed">
                      Collect actions shift global eco balances. Drag the slider to simulate average community EcoScores and observe 2050 environment projections.
                    </p>

                    {/* Simulation Slider */}
                    <div className="space-y-2 py-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-400 dark:text-zinc-500">Global Avg EcoScore</span>
                        <span className="text-primary-500">{simulatorScore} / 100</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={simulatorScore}
                        onChange={(e) => setSimulatorScore(parseInt(e.target.value))}
                        className="w-full accent-primary-500 bg-slate-200 dark:bg-zinc-800 rounded-lg h-2"
                      />
                    </div>

                    {/* Projections breakdown */}
                    <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] pt-1">
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850">
                        <span className="block font-bold text-slate-400 dark:text-zinc-550 uppercase text-[8px] tracking-wider">Temp Rise</span>
                        <span className={`block text-xs font-black mt-0.5 ${tempIncrease >= 2.5 ? 'text-red-500' : tempIncrease >= 1.5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          +{tempIncrease}°C
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850">
                        <span className="block font-bold text-slate-400 dark:text-zinc-550 uppercase text-[8px] tracking-wider">Ice Caps</span>
                        <span className="block text-xs font-black text-blue-500 mt-0.5">
                          {iceCapLevel}%
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-850">
                        <span className="block font-bold text-slate-400 dark:text-zinc-550 uppercase text-[8px] tracking-wider">Green Cover</span>
                        <span className="block text-xs font-black text-emerald-500 mt-0.5">
                          {greenCover}%
                        </span>
                      </div>
                    </div>

                    {/* Threat indicator */}
                    <div className="p-3 rounded-xl border border-slate-150 dark:border-zinc-800/80 bg-white dark:bg-zinc-905 flex items-center justify-between text-[10px] font-sans">
                      <span className="font-bold text-slate-400 dark:text-zinc-550">Risk Standing:</span>
                      <span className={`font-black uppercase tracking-wider ${riskColor}`}>
                        {globalRisk}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SETTINGS CUSTOMIZATION */}
              {activeTab === 'settings' && (
                <div className="space-y-4 text-left">
                  {/* Language */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      {text.settingsLanguage}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 rounded-xl py-2 px-3 focus:outline-none text-xs text-slate-700 dark:text-slate-300 font-sans font-bold"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Telugu">తెలుగు (Telugu)</option>
                      <option value="Malayalam">മലയാളം (Malayalam)</option>
                    </select>
                  </div>

                  {/* Personality */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      {text.settingsPersonality}
                    </label>
                    <select
                      value={personality}
                      onChange={(e) => setPersonality(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 rounded-xl py-2 px-3 focus:outline-none text-xs text-slate-700 dark:text-slate-300 font-sans font-bold"
                    >
                      <option value="Friendly">Friendly Coach</option>
                      <option value="Academic">Academic Specialist</option>
                      <option value="Enthusiastic">Enthusiastic Guide</option>
                    </select>
                  </div>

                  {/* Voice Gender */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      {text.settingsVoice}
                    </label>
                    <select
                      value={voiceGender}
                      onChange={(e) => setVoiceGender(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 rounded-xl py-2 px-3 focus:outline-none text-xs text-slate-700 dark:text-slate-300 font-sans font-bold"
                    >
                      <option value="Female">Female Voice</option>
                      <option value="Male">Male Voice</option>
                    </select>
                  </div>

                  {/* Alerts Frequency */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                      {text.settingsAlerts}
                    </label>
                    <select
                      value={alertFreq}
                      onChange={(e) => setAlertFreq(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800/80 rounded-xl py-2 px-3 focus:outline-none text-xs text-slate-700 dark:text-slate-300 font-sans font-bold"
                    >
                      <option value="Low">Low (Only Critical)</option>
                      <option value="Medium">Medium (Regular Tips)</option>
                      <option value="High">High (Proactive Observes)</option>
                    </select>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default CopilotChat;
