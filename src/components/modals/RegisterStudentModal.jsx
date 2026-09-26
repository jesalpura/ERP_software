import React, { useState } from 'react';
import { X, UserPlus, Sparkles } from 'lucide-react';

export default function RegisterStudentModal({ isOpen, onClose, onRegisterStudent }) {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('MERN Full Stack');
  const [lab, setLab] = useState('Lab 01');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [totalFee, setTotalFee] = useState('32000');
  const [paidFee, setPaidFee] = useState('8000');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudent = {
      id: `AT-2024-${Math.floor(100 + Math.random() * 900)}`,
      name,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      course,
      batch: `${course.split(' ')[0]}-B1 (10:00 AM - 12:00 PM)`,
      lab,
      totalFee: Number(totalFee) || 30000,
      paidFee: Number(paidFee) || 8000,
      pendingFee: (Number(totalFee) || 30000) - (Number(paidFee) || 8000),
      status: 'Active',
      attendance: 100,
      phone: phone || '+91 98765 00000',
      email: email || 'student@example.com',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    onRegisterStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Register New Student</h2>
              <p className="text-[11px] text-slate-500">Add admission record & assign workstation lab seat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Mukherjee"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Course Program</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="MERN Full Stack">MERN Full Stack</option>
                <option value="Tally Prime + GST">Tally Prime + GST</option>
                <option value="Python & Django">Python & Django</option>
                <option value="Java Spring Boot">Java Spring Boot</option>
                <option value="CCC & Office Basics">CCC & Office Basics</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Assigned Lab</label>
              <select
                value={lab}
                onChange={(e) => setLab(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="Lab 01">Lab 01 (MERN)</option>
                <option value="Lab 02">Lab 02 (Tally)</option>
                <option value="Lab 03">Lab 03 (Java)</option>
                <option value="Lab 04">Lab 04 (CCC)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Total Course Fee (₹)</label>
              <input
                type="number"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">First Deposit (₹)</label>
              <input
                type="number"
                value={paidFee}
                onChange={(e) => setPaidFee(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-emerald-600 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-md shadow-blue-500/20"
            >
              Confirm Admission
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
