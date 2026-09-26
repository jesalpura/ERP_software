import React, { useState } from 'react';
import { X, Megaphone, Bell, Sparkles, Send, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function PublishNoticeModal({ isOpen, onClose, onPublishNotice }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic Schedule');
  const [priority, setPriority] = useState('High');
  const [audience, setAudience] = useState('All Campus');
  const [body, setBody] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    const newNotice = {
      id: `NOT-${Math.floor(100 + Math.random() * 900)}`,
      title: title.trim(),
      category,
      priority,
      audience,
      body: body.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: 'Just now'
    };

    onPublishNotice(newNotice);
    
    // Reset form
    setTitle('');
    setCategory('Academic Schedule');
    setPriority('High');
    setAudience('All Campus');
    setBody('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 flex flex-col gap-5 text-slate-900 relative my-auto max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30 shrink-0">
            <Megaphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-900">Publish Campus Announcement</h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold border border-indigo-200">
                LIVE BROADCAST
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Broadcast official notices live to all student, faculty, and staff notification bells
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-slate-700">Notice Title / Subject *</label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Holiday Schedule & Practical Exam Dates"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Notice Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Academic Schedule">Academic Schedule</option>
                <option value="Finance & Dues">Finance & Fee Dues</option>
                <option value="Exam & Admit Card">Exam & Admit Card</option>
                <option value="Lab & Infrastructure">Lab & Infrastructure</option>
                <option value="Emergency Alert">Emergency Alert</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-slate-700">Urgency Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Urgent">🚨 Urgent Alert</option>
                <option value="High">⚠️ High Priority</option>
                <option value="Normal">ℹ️ Normal Announcement</option>
              </select>
            </div>
          </div>

          {/* Target Audience */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-slate-700">Target Audience</label>
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
              {[
                { label: 'All Campus', value: 'All Campus' },
                { label: 'Students Only', value: 'Students Only' },
                { label: 'Faculty Only', value: 'Faculty Only' }
              ].map((aud) => (
                <button
                  key={aud.value}
                  type="button"
                  onClick={() => setAudience(aud.value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    audience === aud.value
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body Details */}
          <div className="flex flex-col gap-1 text-xs">
            <label className="font-bold text-slate-700">Detailed Message / Body *</label>
            <textarea
              rows={3}
              required
              placeholder="Enter full notice contents, instructions, or deadlines for students and faculty..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Preview Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex flex-col gap-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Notification Bell Preview</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-slate-900 truncate">{title || 'Notice Title Preview'}</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                priority === 'Urgent' ? 'bg-rose-100 text-rose-800' :
                priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {priority}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
              {body || 'Detailed notice body preview will appear here...'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors shadow-md flex items-center justify-center gap-2 border border-indigo-500/50"
            >
              <Send className="w-4 h-4" />
              <span>Publish & Broadcast Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
