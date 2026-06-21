import React, { useState } from 'react';
import { Award, ShieldCheck, Ticket, AlertCircle, Coins, Copy, Check, Twitter, Share2 } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export const Rewards: React.FC = () => {
  const { user, redeemReward } = useAuth();
  const [selectedReward, setSelectedReward] = useState<any | null>(null);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const balance = user?.greenCoins || 0;

  const catalog = [
    {
      id: 'reward_oak',
      title: 'Sponsor a Native Oak Tree',
      desc: 'Plants a physical, verified Native Oak tree in a reforestation reserve. Toggles carbon offset ratings and adds an active tree badge.',
      cost: 400,
      type: 'tree',
      badgeIcon: '🌳',
      badgeName: 'Oak Sponsor',
      socialTemplate: 'I sponsored a physical Native Oak tree via CarbonMind AI! 🌳 Join me in taking small actions for massive carbon impact:'
    },
    {
      id: 'reward_succulent',
      title: 'Digital Succulent Plant Badge',
      desc: 'A gorgeous, shareable digital credential badge representing domestic greening. Proudly show this on other social channels.',
      cost: 200,
      type: 'badge',
      badgeIcon: '🪴',
      badgeName: 'Succulent Grower',
      socialTemplate: 'I just earned the "Digital Succulent Grower" Badge on CarbonMind AI! 🪴 Check out how you can track your carbon footprint:'
    },
    {
      id: 'reward_pioneer_cert',
      title: 'Green Canopy Pioneer Certificate',
      desc: 'An official, certified environmental pioneer credential card verifying your positive environmental status.',
      cost: 600,
      type: 'certificate',
      badgeIcon: '📜',
      badgeName: 'Pioneer Graduate',
      socialTemplate: 'I am officially a certified Green Canopy Pioneer on CarbonMind AI! 📜 My verified carbon savings are helping build a green future:'
    },
    {
      id: 'reward_bamboo',
      title: 'Sponsor a Bamboo Shoot',
      desc: 'Plant a rapid-absorption bamboo shoot. Bamboo sequesters carbon extremely fast, providing immediate eco-rating increases.',
      cost: 300,
      type: 'tree',
      badgeIcon: '🎋',
      badgeName: 'Bamboo Sponsor',
      socialTemplate: 'I just sponsored a rapid-growth Bamboo Shoot via CarbonMind AI! 🎋 Get your dynamic green credentials here:'
    },
    {
      id: 'reward_pine',
      title: 'Sponsor a High-Altitude Pine',
      desc: 'Plant a pine sapling in high-altitude soil, restoring mountaintop biodiversity, supporting local soil stability, and offsetting CO₂.',
      cost: 500,
      type: 'tree',
      badgeIcon: '🌲',
      badgeName: 'Pine Sponsor',
      socialTemplate: 'I just sponsored a High-Altitude Pine tree to build permanent biodiversity! 🌲 Join the CarbonMind network and do your part:'
    },
    {
      id: 'reward_eco_warrior_badge',
      title: 'Verified Eco Warrior Credential',
      desc: 'A prestigious digital credential certifying that your EcoScore exceeds 80/100. Showcase this credential to establish your sustainable leadership.',
      cost: 800,
      type: 'credential',
      badgeIcon: '🎖️',
      badgeName: 'Eco Warrior',
      socialTemplate: 'I was just certified as an Eco Warrior on CarbonMind AI! 🎖️ My carbon efficiency rating is in the top 10%. Check your EcoScore here:'
    }
  ];

  const handleClaim = async () => {
    if (!selectedReward) return;
    setErrorMsg(null);
    try {
      await redeemReward(selectedReward.id, selectedReward.cost, selectedReward.title);
      setClaimSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Redemption failed. Please try again.');
    }
  };

  const handleCopyShareText = (text: string) => {
    const inviteLink = `${window.location.origin}/register?ref=${user?.uid || 'eco-pioneer'}`;
    const fullText = `${text} ${inviteLink}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-900 pb-4">
        <SectionHeader
          title="Green Natures & Credentials Store"
          description="Sponsor physical trees, earn digital plant badges, and verify environmental credentials to share with the world."
        />
        {/* Dynamic Balance indicator */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-primary-500/10 border border-primary-500/20 rounded-2xl shrink-0 font-sans">
          <Coins className="h-5 w-5 text-primary-500" />
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Available Coins</p>
            <h4 className="text-sm font-extrabold text-slate-805 dark:text-slate-100 mt-0.5">{balance.toLocaleString()} Coins</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalog.map((item) => {
          const canAfford = balance >= item.cost;
          return (
            <Card key={item.id} variant="glass" className="flex flex-col justify-between p-6 space-y-6 relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 bg-slate-50 dark:bg-zinc-850 rounded-2xl select-none group-hover:scale-110 transition-transform duration-250">
                    {item.badgeIcon}
                  </span>
                  <Badge variant="premium" size="md">{item.cost.toLocaleString()} Coins</Badge>
                </div>

                <div className="space-y-2 font-sans">
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-primary-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-450 dark:text-zinc-550">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-900 flex justify-end">
                <Button
                  variant={canAfford ? 'primary' : 'glass'}
                  size="sm"
                  onClick={() => {
                    setErrorMsg(null);
                    setClaimSuccess(false);
                    setSelectedReward(item);
                  }}
                >
                  {canAfford ? 'Redeem Voucher' : 'Insufficient Coins'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Claim confirmation dialog */}
      <Modal
        isOpen={!!selectedReward}
        onClose={() => {
          setSelectedReward(null);
          setClaimSuccess(false);
        }}
        title={claimSuccess ? 'Redemption Successful!' : 'Confirm Eco-Credential Claim'}
      >
        {claimSuccess ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-6 font-sans">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-full animate-bounce">
              <ShieldCheck className="h-10 w-10" />
            </div>
            
            <div className="w-full max-w-sm p-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-emerald-500/20 text-white text-left relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 text-emerald-400 font-sans text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">
                Verifiable Credential
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl p-1 bg-emerald-500/10 rounded-xl">{selectedReward?.badgeIcon}</span>
                  <div>
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-sans">CarbonMind AI OS</h4>
                    <p className="text-xs text-emerald-450 font-bold font-sans">Credential Status: Active</p>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 space-y-1">
                  <span className="block text-[8px] text-zinc-500 uppercase font-black font-sans">Credential Name</span>
                  <p className="text-sm font-extrabold text-white leading-tight font-sans">{selectedReward?.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-850 pt-3">
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase font-black font-sans">Issued To</span>
                    <p className="text-xs font-bold text-white truncate font-sans">{user?.displayName || 'Eco Pioneer'}</p>
                  </div>
                  <div>
                    <span className="block text-[8px] text-zinc-500 uppercase font-black font-sans">Date Issued</span>
                    <p className="text-xs font-bold text-white font-sans">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3">
                  <span className="block text-[8px] text-zinc-500 uppercase font-black font-sans">Verification ID</span>
                  <p className="text-[10px] font-mono text-zinc-400">CM-CRD-{Math.random().toString(36).substring(3, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-450 leading-relaxed max-w-xs font-sans">
              This credential has been successfully issued! Share it to help others know about us and sign up.
            </p>

            <div className="flex flex-col gap-2 w-full pt-4 border-t border-slate-100 dark:border-zinc-900 font-sans">
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => handleCopyShareText(selectedReward?.socialTemplate)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-50 dark:bg-zinc-900 text-slate-750 dark:text-zinc-200 border border-slate-150 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-850 transition-all flex items-center justify-center gap-1.5"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied invite!' : 'Copy Share Code & Invite'}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedReward?.socialTemplate + ' ' + window.location.origin + '/register?ref=' + (user?.uid || 'pioneer'))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-sky-500 hover:bg-sky-600 text-white transition-all flex items-center justify-center gap-1.5"
                >
                  <Twitter className="h-4 w-4" /> Share on X
                </a>
              </div>
              <Button variant="glass" className="w-full" onClick={() => {
                setSelectedReward(null);
                setClaimSuccess(false);
              }}>
                Close Window
              </Button>
            </div>
          </div>
        ) : selectedReward ? (
          <div className="space-y-5 font-sans">
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              Are you sure you want to redeem <span className="font-bold text-slate-805 dark:text-slate-205">{selectedReward.title}</span> for <span className="text-primary-500 font-bold">{selectedReward.cost} Coins</span>?
            </p>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-450 rounded-xl text-xs flex gap-2">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>Redeemed coins will be deducted from your total balance immediately.</span>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="glass" onClick={() => setSelectedReward(null)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={balance < selectedReward.cost}
                onClick={handleClaim}
              >
                Confirm Claim
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
export default Rewards;
