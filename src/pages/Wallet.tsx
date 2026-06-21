import React from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Award, Flame, Droplet, Trees, DollarSign } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Wallet: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate dynamic offset metrics from activities and history
  const totalCarbonSaved = (user?.activities || []).reduce((sum, act) => sum + (act.savedKg || 0), 0) +
                           (user?.trips || []).reduce((sum, t) => sum + (t.route?.carbonSavedKg || 0), 0);
  const totalWaterSaved = (user?.activities || []).reduce((sum, act) => sum + (act.waterSaved || 0), 0);
  const totalMoneySaved = (user?.activities || []).reduce((sum, act) => sum + (act.moneySaved || 0), 0);
  const totalTrees = (user?.shoppingForestTrees || 0) + (user?.mealForestTrees || 0);

  const transactions = user?.transactions || [];
  const activeCoupons = transactions.filter((tx) => tx.type === 'claim');

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="Green Wallet"
        description="Monitor ecological points balance, active rewards coupons, and verified offset investments."
      />

      {/* Dynamic Environmental Offsets summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="glass" className="p-4 flex flex-col justify-between h-28 border-emerald-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase">CO₂ Offsets</span>
            <Flame className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{totalCarbonSaved.toFixed(1)} kg</h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Carbon offset achieved</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex flex-col justify-between h-28 border-blue-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase">Water Preserved</span>
            <Droplet className="h-4.5 w-4.5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{totalWaterSaved.toLocaleString()} L</h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Water saved from choices</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex flex-col justify-between h-28 border-amber-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase">Money Saved</span>
            <DollarSign className="h-4.5 w-4.5 text-amber-500" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">${totalMoneySaved.toFixed(2)}</h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Total bills & fuel saved</p>
          </div>
        </Card>

        <Card variant="glass" className="p-4 flex flex-col justify-between h-28 border-primary-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase">Virtual Trees</span>
            <Trees className="h-4.5 w-4.5 text-primary-500" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">{totalTrees} Trees</h4>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500">Shopping & Meal Forest</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wallet Balance Cards */}
        <div className="space-y-6">
          <Card variant="glass" className="bg-gradient-to-br from-emerald-500/15 via-primary-500/5 to-secondary-500/15 border-primary-500/20 p-6 flex flex-col justify-between h-48 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <WalletIcon className="h-6 w-6 text-primary-500" />
              <Badge variant="premium" size="md">VERIFIED</Badge>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
                Total Green Coins
              </p>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 font-sans mt-1">
                {(user?.greenCoins || 0).toLocaleString()} Coins
              </h2>
            </div>
          </Card>

          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">
              Wallet Actions
            </h3>
            <div className="flex flex-col gap-2">
              <Button variant="primary" className="w-full" onClick={() => navigate('/rewards')}>
                Visit Rewards Store
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/challenges')}>
                Join Daily Challenges
              </Button>
            </div>
          </Card>
        </div>

        {/* Transactions log */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
              Recent Transactions
            </h3>

            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-zinc-500 text-xs">
                No transactions yet. Complete scans, missions, and challenges to earn Green Coins!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-900">
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        tx.type === 'earn'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {tx.type === 'earn' ? <ArrowUpRight className="h-4.5 w-4.5" /> : <ArrowDownRight className="h-4.5 w-4.5" />}
                      </div>
                      <div className="font-sans">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{tx.title}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-550 mt-0.5">{tx.desc} • {tx.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold font-sans ${
                      tx.type === 'earn' ? 'text-emerald-600 dark:text-emerald-450' : 'text-amber-600 dark:text-amber-450'
                    }`}>
                      {tx.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Active Redeemed Vouchers drawer */}
          <Card variant="glass" className="p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-sans">
              Your Unlocked Vouchers
            </h3>

            {activeCoupons.length === 0 ? (
              <div className="text-center py-8 text-slate-400 dark:text-zinc-550 text-xs">
                No active vouchers redeemed. Visit the Rewards Store to exchange your coins for transit passes and charging keys.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCoupons.map((coupon) => (
                  <div key={coupon.id} className="p-4 bg-slate-50/40 dark:bg-zinc-950/20 border border-slate-150 dark:border-zinc-900 rounded-2xl flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-primary-500 font-sans">{coupon.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">{coupon.date}</p>
                    </div>
                    <div className="flex items-center justify-between bg-primary-500/5 border border-primary-500/10 rounded-xl px-3 py-2">
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {coupon.desc.replace('Voucher Code: ', '')}
                      </span>
                      <Badge variant="success" size="sm">ACTIVE</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Wallet;
