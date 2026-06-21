import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, ShieldCheck, ShieldAlert, Trash2, Globe, Lock } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // States
  const [language, setLanguage] = useState('en');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  const handleDeleteAccount = async () => {
    setDeleteOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300 font-sans">
      <SectionHeader
        title="Settings"
        description="Configure client configurations, theme persistency modes, and general alerts."
      />

      <div className="max-w-2xl space-y-6">
        <Card variant="glass" className="p-6 border border-slate-150/50 dark:border-zinc-850">
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-655 dark:text-emerald-450 rounded-xl text-xs font-semibold mb-4 animate-pulse flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5" />
              Settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* Theme Toggle section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-zinc-550">
                Visual Theme
              </h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all ${
                    theme === 'dark'
                      ? 'bg-zinc-900 border-primary-500/30 text-primary-400'
                      : 'bg-slate-50 border-slate-205 text-slate-400'
                  }`}
                >
                  <Moon className="h-4 w-4" /> Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-bold text-xs transition-all ${
                    theme === 'light'
                      ? 'bg-white border-primary-500/30 text-primary-600 shadow-sm'
                      : 'bg-zinc-900/20 border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Sun className="h-4 w-4" /> Light Mode
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-zinc-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-zinc-550 flex items-center gap-1.5">
                <Globe className="h-4.5 w-4.5 text-primary-500" />
                Language / Region
              </h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-805 dark:text-slate-200"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {/* Notification alert checks */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-zinc-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-zinc-550 flex items-center gap-1.5">
                <Bell className="h-4.5 w-4.5 text-primary-500" />
                Notification Controls
              </h3>
              
              <div className="space-y-3 text-xs sm:text-sm">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="font-sans text-left">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Email Notifications</p>
                    <p className="text-[10px] text-slate-450 dark:text-zinc-550 mt-0.5">Receive notifications for community mentions and carbon milestone accomplishments.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={weeklyReport}
                    onChange={(e) => setWeeklyReport(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="font-sans text-left">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Weekly Sustainability Digest</p>
                    <p className="text-[10px] text-slate-450 dark:text-zinc-550 mt-0.5">Receive month-by-month actual vs AI forecasted trends reports directly in email inbox.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={securityAlerts}
                    onChange={(e) => setSecurityAlerts(e.target.checked)}
                    className="h-4.5 w-4.5 text-primary-600 focus:ring-primary-500 border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer"
                  />
                  <div className="font-sans text-left">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Security & Sign-In Alerts</p>
                    <p className="text-[10px] text-slate-450 dark:text-zinc-550 mt-0.5">Receive email notices about new sign-in sessions or API token changes.</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-zinc-900">
              <Button type="submit" className="w-full">Save Config Settings</Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card variant="glass" className="p-6 border-red-500/10 dark:border-red-500/5 bg-red-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider font-sans">
                Danger Zone
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1 leading-relaxed max-w-md">
                Permanently purge your CarbonMind AI profile, verified offset logs, eco coins, and challenge achievements. This action is irreversible.
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)} className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <Trash2 className="h-4 w-4" /> Delete Account
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Irreversible Action: Purge Profile">
        <div className="space-y-5 font-sans">
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Are you absolutely sure you want to permanently delete your CarbonMind AI profile? This will wipe your accumulated points, streak indicators, and all historical activity logs.
          </p>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 rounded-xl text-xs flex gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>This action cannot be undone. You will be signed out immediately.</span>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="glass" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteAccount}>Purge Profile</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
export default Settings;
