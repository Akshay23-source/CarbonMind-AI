import React, { useState } from 'react';
import { Users, UserPlus, Heart, MessageSquare, Send, Award, Trees, ShieldAlert, CheckCircle, GraduationCap } from 'lucide-react';
import { SectionHeader } from '../components/SectionHeader';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';

export const Community: React.FC = () => {
  const { user, addSocialPost, likePost, joinCollege, inviteToFamily } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'college' | 'family'>('feed');

  // Social feed states
  const [newPostContent, setNewPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('travel');

  // College states
  const [collegeInput, setCollegeInput] = useState('');
  const [deptInput, setDeptInput] = useState('');

  // Family states
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const posts = user?.socialPosts || [];
  const college = user?.collegeDetails;
  const family = user?.familyDetails || { invitations: [], familyScore: 75, familyForestTrees: 10 };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      await addSocialPost(newPostContent, postCategory);
      setNewPostContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await likePost(postId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeInput.trim() || !deptInput.trim()) return;
    try {
      await joinCollege(collegeInput, deptInput);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      await inviteToFamily(inviteEmail);
      setInviteEmail('');
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Generate department ranking lists if user joined
  const getDeptRankings = () => {
    if (!college?.collegeName) return [];
    
    // User's own department XP
    const userXP = ((user?.level || 1) - 1) * 300 + (user?.xp || 150);

    const depts = [
      { name: 'Computer Science', xp: 24500, activeStudents: 154 },
      { name: 'Mechanical Engineering', xp: 18200, activeStudents: 92 },
      { name: 'Business School', xp: 15900, activeStudents: 110 },
      { name: 'Biology', xp: 12400, activeStudents: 64 },
      { name: college.departmentName, xp: userXP + 4500, activeStudents: 22 }
    ];

    // Remove duplicates if user joins one of the seeded depts
    const uniqueDepts = depts.reduce((acc: typeof depts, current) => {
      const x = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase());
      if (!x) {
        return acc.concat([current]);
      } else {
        // Update user dept XP with the userXP addition
        if (current.name === college.departmentName) {
          x.xp = userXP + 4500;
        }
        return acc;
      }
    }, []);

    return uniqueDepts.sort((a, b) => b.xp - a.xp).map((d, index) => ({ ...d, rank: index + 1 }));
  };

  const deptRankings = getDeptRankings();

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      <SectionHeader
        title="Eco Community"
        description="Share carbon logs, join collegiate networks, and compete in family offset challenges."
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-zinc-900 pb-px">
        <button
          onClick={() => setActiveTab('feed')}
          className={`px-6 py-3.5 text-sm font-bold font-sans border-b-2 transition-all duration-200 ${
            activeTab === 'feed'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Social Feed
        </button>
        <button
          onClick={() => setActiveTab('college')}
          className={`px-6 py-3.5 text-sm font-bold font-sans border-b-2 transition-all duration-200 ${
            activeTab === 'college'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          College Competitions
        </button>
        <button
          onClick={() => setActiveTab('family')}
          className={`px-6 py-3.5 text-sm font-bold font-sans border-b-2 transition-all duration-200 ${
            activeTab === 'family'
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-slate-400 dark:text-zinc-550 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          Family Mode
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Creation & Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Post Card */}
            <Card variant="glass" className="p-5 space-y-4">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a carbon offset milestone or vegan recipe with the community..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-850 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto font-sans">
                    <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase">Category:</span>
                    <select
                      value={postCategory}
                      onChange={(e) => setPostCategory(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-905 border border-slate-150 dark:border-zinc-800 rounded-xl text-xs text-slate-750 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="travel">Travel 🚲</option>
                      <option value="energy">Energy 💡</option>
                      <option value="food">Diet 🥗</option>
                      <option value="waste">Waste 🔌</option>
                    </select>
                  </div>

                  <Button type="submit" variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2">
                    <Send className="h-4 w-4" />
                    Share Update
                  </Button>
                </div>
              </form>
            </Card>

            {/* Social Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} variant="glass" className="p-5 space-y-4">
                  <div className="flex justify-between items-start font-sans">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${post.author}`}
                        name={post.author}
                        size="sm"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-150">{post.author}</h4>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">{post.date}</p>
                      </div>
                    </div>
                    <Badge variant="info" size="sm" className="uppercase font-mono text-[9px]">
                      {post.category}
                    </Badge>
                  </div>

                  <p className="text-sm leading-relaxed text-slate-650 dark:text-zinc-350">
                    {post.content}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-zinc-900 flex gap-4 font-sans text-xs">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        post.liked
                          ? 'text-red-500 font-bold'
                          : 'text-slate-400 dark:text-zinc-550 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-4.5 w-4.5 ${post.liked ? 'fill-red-500 text-red-500' : ''}`} />
                      {post.likes} Likes
                    </button>
                    <span className="text-slate-400 dark:text-zinc-550 flex items-center gap-1.5">
                      <MessageSquare className="h-4.5 w-4.5" />
                      Comments
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Social Stats Sidebar */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-sans">
                Eco Guild Guidelines
              </h3>
              <p className="text-xs leading-relaxed text-slate-450 dark:text-zinc-550 font-sans">
                Earn positive reputation points by posting helpful recycling tips, sharing zero-emission cycling commutes, and motivating peers to swap standard lightbulbs for LEDs. Keep it green!
              </p>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'college' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {!college?.collegeName ? (
            <Card variant="glass" className="p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-7 w-7 text-primary-500" />
                <h3 className="text-lg font-extrabold text-slate-805 dark:text-slate-100 font-sans">Join College League</h3>
              </div>
              <p className="text-xs text-slate-450 dark:text-zinc-550 font-sans leading-relaxed">
                Connect your academic campus to CarbonMind AI. Join your university student community and rank departments to see who achieves the largest carbon footprint reduction.
              </p>

              <form onSubmit={handleJoinCollege} className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase">University Name</label>
                  <input
                    type="text"
                    required
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    placeholder="e.g. Stanford University"
                    className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-zinc-550 uppercase">Department</label>
                  <input
                    type="text"
                    required
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <Button type="submit" className="w-full">Initialize Campus Sync</Button>
                </div>
              </form>
            </Card>
          ) : (
            <div className="space-y-6 font-sans">
              <Card variant="glass" className="p-6 bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <Badge variant="premium" size="sm" className="mb-2">OFFICIAL SYNC</Badge>
                  <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{college.collegeName}</h3>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Active Department: {college.departmentName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-bold">Dept. Rank</p>
                  <h2 className="text-2xl font-extrabold text-primary-500 mt-1">
                    #{deptRankings.find(d => d.name === college.departmentName)?.rank || 5}
                  </h2>
                </div>
              </Card>

              {/* Department rankings list */}
              <Card variant="glass" className="overflow-hidden p-0">
                <div className="p-5 border-b border-slate-100 dark:border-zinc-900">
                  <h4 className="text-sm font-bold text-slate-805 dark:text-slate-205">Department Leaderboard</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-950/20 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-550">
                        <th className="py-4 px-6 w-20">Rank</th>
                        <th className="py-4 px-6">Department</th>
                        <th className="py-4 px-6">Students Active</th>
                        <th className="py-4 px-6 text-right">Points Accumulated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-900 text-xs sm:text-sm">
                      {deptRankings.map((dept) => (
                        <tr
                          key={dept.name}
                          className={dept.name === college.departmentName ? 'bg-primary-500/5' : 'hover:bg-slate-50/20 dark:hover:bg-zinc-950/5'}
                        >
                          <td className="py-4 px-6 font-bold text-slate-450 dark:text-zinc-500">#{dept.rank}</td>
                          <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-150">{dept.name}</td>
                          <td className="py-4 px-6 text-slate-500 dark:text-zinc-400">{dept.activeStudents} students</td>
                          <td className="py-4 px-6 text-right font-bold text-primary-500">{dept.xp.toLocaleString()} pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {activeTab === 'family' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
          {/* Family Stats & Forest display */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* EcoScore card */}
              <Card variant="glass" className="p-6 space-y-4 flex flex-col justify-between border-primary-500/10">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Family EcoScore</h4>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Average environment ranking of all members</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-extrabold text-emerald-500">{family.familyScore}</h2>
                  <span className="text-xs text-slate-400 dark:text-zinc-500">/ 100</span>
                </div>
              </Card>

              {/* Family Forest card */}
              <Card variant="glass" className="p-6 space-y-4 flex flex-col justify-between border-emerald-500/10">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Family Forest</h4>
                  <Trees className="h-5 w-5 text-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{family.familyForestTrees} Trees</h2>
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-1">Grown from collective household carbon savings</p>
                </div>
              </Card>
            </div>

            {/* Family Members list */}
            <Card variant="glass" className="p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Household Members</h3>
              <div className="divide-y divide-slate-100 dark:divide-zinc-900">
                {/* You */}
                <div className="flex items-center justify-between py-3.5 first:pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user?.displayName || 'You'}`} name="You" size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{user?.displayName || 'You'} (You)</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Level {user?.level || 1} Explorer</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Admin</Badge>
                </div>

                {/* Clara */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar src="https://api.dicebear.com/7.x/bottts/svg?seed=clara" name="Clara Oswald" size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Clara Oswald</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Level 4 Explorer</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">Active</Badge>
                </div>

                {/* Danny */}
                <div className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar src="https://api.dicebear.com/7.x/bottts/svg?seed=danny" name="Danny Pink" size="sm" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Danny Pink</p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">Level 3 Explorer</p>
                    </div>
                  </div>
                  <Badge variant="info" size="sm">Active</Badge>
                </div>

                {/* Sent invitations */}
                {(family.invitations || []).map((email: string) => (
                  <div key={email} className="flex items-center justify-between py-3.5 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar src={`https://api.dicebear.com/7.x/bottts/svg?seed=${email}`} name={email} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-slate-405 dark:text-zinc-500">{email}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">Invitation sent</p>
                      </div>
                    </div>
                    <Badge variant="neutral" size="sm">Pending</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Invitation Panel */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-500" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Invite Family Member</h3>
              </div>

              {inviteSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  Invitation dispatched!
                </div>
              )}

              <form onSubmit={handleInviteFamily} className="space-y-3">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="family@member.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 dark:bg-zinc-900 border border-slate-150 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-slate-800 dark:text-slate-200"
                />
                <Button type="submit" className="w-full">Send Invitation</Button>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
export default Community;
