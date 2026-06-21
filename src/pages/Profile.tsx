import React, { useState } from 'react';
import { Leaf, Award, Calendar, ShieldCheck, Mail, Edit2, Check } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

const natureAvatars = {
  animals: [
    { name: 'Red Fox', url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=150&auto=format&fit=crop&q=80' },
    { name: 'Giant Panda', url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=150&auto=format&fit=crop&q=80' },
    { name: 'Red Squirrel', url: 'https://images.unsplash.com/photo-1507666405895-422efe53f00d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Fawn Deer', url: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=150&auto=format&fit=crop&q=80' },
    { name: 'Koala Bear', url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=150&auto=format&fit=crop&q=80' },
    { name: 'Bengal Tiger', url: 'https://images.unsplash.com/photo-1508135868938-1e423759a857?w=150&auto=format&fit=crop&q=80' }
  ],
  birds: [
    { name: 'Barn Owl', url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=150&auto=format&fit=crop&q=80' },
    { name: 'Kingfisher', url: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=150&auto=format&fit=crop&q=80' },
    { name: 'Macaw Parrot', url: 'https://images.unsplash.com/photo-1552728089-57bdde30ebd3?w=150&auto=format&fit=crop&q=80' },
    { name: 'White Swan', url: 'https://images.unsplash.com/photo-1511216113906-8f57bb83e776?w=150&auto=format&fit=crop&q=80' },
    { name: 'Pink Flamingo', url: 'https://images.unsplash.com/photo-1519782501062-897db6746ef7?w=150&auto=format&fit=crop&q=80' }
  ],
  trees: [
    { name: 'Pine Tree', url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=150&auto=format&fit=crop&q=80' },
    { name: 'Palm Tree', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=150&auto=format&fit=crop&q=80' },
    { name: 'Sakura Blossom', url: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?w=150&auto=format&fit=crop&q=80' },
    { name: 'Bonsai', url: 'https://images.unsplash.com/photo-1512428813824-f713c2411abb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Maple Leaf', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=150&auto=format&fit=crop&q=80' },
    { name: 'Cactus Plant', url: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=150&auto=format&fit=crop&q=80' }
  ]
};

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState(user?.displayName || '');
  const [occupation, setOccupation] = useState(user?.onboardingData?.basicInfo?.occupation || '');
  const [selectedPhoto, setSelectedPhoto] = useState(user?.photoURL || '');
  const [avatarTab, setAvatarTab] = useState<'animals' | 'birds' | 'trees'>('animals');
  const [saving, setSaving] = useState(false);

  const badges = [
    { name: 'Commute Sage', desc: 'Offsets 50kg travel emissions via bicycle/bus', date: 'Earned May 2026', icon: '🚲' },
    { name: 'Veggie Hero', desc: 'Logged 20 plant-based meals consecutively', date: 'Earned Apr 2026', icon: '🥗' },
    { name: 'First Acorn', desc: 'Created verified profile on CarbonMind', date: 'Earned Mar 2026', icon: '🌱' }
  ];

  const openEditModal = () => {
    setName(user?.displayName || '');
    setOccupation(user?.onboardingData?.basicInfo?.occupation || '');
    setSelectedPhoto(user?.photoURL || '');
    setEditOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(name, occupation, selectedPhoto);
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="My Profile"
        description="Review credentials, ecological status, and collection achievements badges."
      >
        <Button variant="secondary" size="sm" className="flex items-center gap-1.5" onClick={openEditModal}>
          <Edit2 className="h-4 w-4" /> Edit Profile
        </Button>
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <Card variant="glass" className="p-6 space-y-6 flex flex-col items-center justify-center text-center">
          <Avatar
            src={user?.photoURL || undefined}
            name={user?.displayName || 'User'}
            size="xl"
            status="online"
          />
          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-805 dark:text-slate-100 font-sans">
              {user?.displayName || 'Eco Pioneer'}
            </h3>
            {user?.onboardingData?.basicInfo?.occupation && (
              <p className="text-xs text-slate-400 dark:text-zinc-550 font-semibold uppercase tracking-wider">
                {user.onboardingData.basicInfo.occupation}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-zinc-555 flex items-center justify-center gap-1 mt-1 font-sans">
              <Mail className="h-3.5 w-3.5" />
              {user?.email}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-zinc-900 grid grid-cols-2 gap-4">
            <div className="text-center font-sans">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-200">Level {user?.level || 1}</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-550 font-bold uppercase mt-0.5">Eco Ranking</p>
            </div>
            <div className="text-center font-sans">
              <p className="text-lg font-bold text-emerald-500">{user?.ecoScore || 75}</p>
              <p className="text-[10px] text-slate-400 dark:text-zinc-550 font-bold uppercase mt-0.5">Eco Score</p>
            </div>
          </div>
        </Card>

        {/* Badges Collection Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 font-sans">
              <Award className="h-5 w-5 text-primary-500" />
              Badges Earned
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((b, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-850 rounded-2xl flex items-start gap-3">
                  <span className="text-3xl p-1">{b.icon}</span>
                  <div className="space-y-1 font-sans">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-150">{b.name}</p>
                    <p className="text-xs text-slate-450 dark:text-zinc-500">{b.desc}</p>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-2">{b.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile Details">
        <form onSubmit={handleSave} className="space-y-5 font-sans text-left">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-850 dark:text-slate-200"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider">
              Occupation
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Software Engineer"
              className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-850 dark:text-slate-200"
            />
          </div>

          {/* Nature Avatar Selector */}
          <div className="space-y-2 border-t border-slate-100 dark:border-zinc-900 pt-4">
            <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase tracking-wider block mb-1">
              Choose Nature Avatar
            </label>
            
            {/* Current avatar preview */}
            <div className="flex items-center gap-4 mb-3 p-3 bg-slate-50/50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-850 rounded-2xl">
              <img 
                src={selectedPhoto || 'https://api.dicebear.com/7.x/bottts/svg?seed=placeholder'} 
                alt="Selected Avatar" 
                className="w-14 h-14 rounded-full object-cover border-2 border-primary-500 bg-white"
              />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Selected Avatar Preview</p>
                <p className="text-[10px] text-slate-405 dark:text-zinc-500 mt-0.5">Choose a photo below to update your profile image</p>
              </div>
            </div>

            {/* Tab Headers */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-zinc-900 pb-2 mb-3">
              {(['animals', 'birds', 'trees'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAvatarTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    avatarTab === tab
                      ? 'bg-primary-500/10 text-primary-500 dark:text-primary-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Avatars Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-36 overflow-y-auto pr-1">
              {natureAvatars[avatarTab].map((avatar) => (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() => setSelectedPhoto(avatar.url)}
                  className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all bg-white ${
                    selectedPhoto === avatar.url
                      ? 'border-primary-500 scale-95 ring-2 ring-primary-500/20'
                      : 'border-transparent hover:border-slate-300 dark:hover:border-zinc-700'
                  }`}
                  title={avatar.name}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <span className="text-[8px] text-white font-extrabold text-center px-1 truncate w-full">
                      {avatar.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-900">
            <Button variant="glass" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={saving} className="flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Save Details
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Profile;
