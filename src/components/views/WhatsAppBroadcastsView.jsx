import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, Users, AlertTriangle, Sparkles } from 'lucide-react';

export default function WhatsAppBroadcastsView({ students }) {
  const [selectedAudience, setSelectedAudience] = useState('Overdue');
  const [template, setTemplate] = useState('fee_reminder');
  const [customText, setCustomText] = useState(
    'Dear {Student_Name}, your fee installment of {Pending_Amount} for {Course} is overdue. Kindly pay via GPay/PhonePe to avoid lab seat lock. Link: https://pay.apextech.edu/due'
  );

  const overdueCount = students.filter((s) => s.status === 'Overdue').length;

  const handleSendBroadcast = () => {
    alert(`WhatsApp Broadcast triggered to ${selectedAudience === 'Overdue' ? overdueCount : students.length} recipients via Meta WhatsApp API Gateway!`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            WhatsApp Broadcast & Automated Alerts <MessageSquare className="w-5 h-5 text-emerald-600" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Send bulk fee reminders, class schedule changes, and instant attendance alerts via official WhatsApp API</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Composer Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-5">
          <h2 className="text-base font-bold text-slate-900">Broadcast Campaign Setup</h2>

          {/* Audience Picker */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Target Audience Segment</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedAudience('Overdue')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  selectedAudience === 'Overdue'
                    ? 'bg-rose-50 border-rose-300 text-rose-900 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Overdue Students ({overdueCount})
                </span>
                <span className="text-[11px] text-slate-500">Students with unpaid fee installments</span>
              </button>

              <button
                onClick={() => setSelectedAudience('All')}
                className={`p-3.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  selectedAudience === 'All'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" /> All Enrolled ({students.length})
                </span>
                <span className="text-[11px] text-slate-500">Entire active student headcount</span>
              </button>
            </div>
          </div>

          {/* Template Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Approved WhatsApp Template</label>
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value);
                if (e.target.value === 'fee_reminder') {
                  setCustomText('Dear {Student_Name}, your fee installment of {Pending_Amount} for {Course} is overdue. Kindly pay via GPay/PhonePe to avoid lab seat lock. Link: https://pay.apextech.edu/due');
                } else if (e.target.value === 'schedule_change') {
                  setCustomText('Notice: Tomorrow Lab 01 MERN Stack session will start at 10:30 AM instead of 10:00 AM due to faculty workshop. Please reach on time.');
                } else {
                  setCustomText('Apex Tech Academy: Admit Card for upcoming Term 2 Practical Examination is ready for download in your Student Portal.');
                }
              }}
              className="w-full h-10 px-3 rounded-xl bg-slate-100 text-xs font-medium border border-transparent outline-none focus:bg-white focus:border-emerald-500"
            >
              <option value="fee_reminder">Fee Due Reminder & Payment Link</option>
              <option value="schedule_change">Class Schedule Change Notice</option>
              <option value="exam_alert">Exam Admit Card Availability</option>
            </select>
          </div>

          {/* Message Text Editor */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Message Body Preview</label>
            <textarea
              rows={5}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 outline-none focus:bg-white focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">Dynamic tags supported: {'{Student_Name}'}, {'{Pending_Amount}'}, {'{Course}'}</span>
          </div>

          <button
            onClick={handleSendBroadcast}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch WhatsApp Blast Now</span>
          </button>
        </div>

        {/* RIGHT PANEL: WhatsApp Chat Mockup */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4 text-slate-900">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm text-white">
              WA
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">WhatsApp Message Simulator</div>
              <div className="text-[10px] text-emerald-600 font-semibold">Official Business Account</div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl flex flex-col gap-3 min-h-[300px] relative justify-end border border-slate-200">
            <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[90%] self-end shadow-sm">
              <p>{customText.replace('{Student_Name}', 'Kabir Sharma').replace('{Pending_Amount}', '₹16,000').replace('{Course}', 'MERN Full Stack')}</p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-100 mt-2">
                <span>05:58 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center text-[11px] text-slate-500 pt-2">
            Messages are delivered via WhatsApp Meta Cloud API with high throughput guarantee.
          </div>
        </div>
      </div>
    </div>
  );
}
