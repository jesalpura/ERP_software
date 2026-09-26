import React, { useState } from 'react';
import { X, Receipt, CheckCircle, QrCode, CreditCard, DollarSign } from 'lucide-react';

export default function CollectFeeModal({ isOpen, onClose, students, onAddTransaction }) {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [amount, setAmount] = useState('4500');
  const [paymentMode, setPaymentMode] = useState('UPI / GPay');
  const [remarks, setRemarks] = useState('Quarterly installment deposit');

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTx = {
      id: `RCP-OCT-${Math.floor(4103 + Math.random() * 900)}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      avatar: currentStudent.avatar,
      course: currentStudent.course,
      mode: paymentMode,
      amount: Number(amount) || 4500,
      timestamp: 'Just Now',
      status: 'Verified & Paid',
      installment: 'Installment Payment',
      remarks
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Instant Fee Collection</h2>
              <p className="text-[11px] text-slate-500">Record payment & generate verified e-voucher receipt</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Enrolled Student *</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-slate-900 outline-none focus:bg-white focus:border-teal-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) — Pending: ₹{s.pendingFee.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Amount Collected (₹) *</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-extrabold text-slate-900 outline-none focus:bg-white focus:border-teal-500 text-sm"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Payment Channel</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-teal-500"
              >
                <option value="UPI / GPay">UPI / GPay / PhonePe</option>
                <option value="Cash Desk">Cash Desk Counter</option>
                <option value="Net Banking">Net Banking NEFT</option>
                <option value="Credit/Debit Card">Credit/Debit Card POS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Receipt Remarks & Reference</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Cleared via Counter 1"
              className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 outline-none focus:bg-white focus:border-teal-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-teal-700" />
              <div>
                <div className="font-bold text-slate-900 text-[11px]">Instant E-Receipt Generation</div>
                <div className="text-[10px] text-slate-500">Official digital seal & voucher token attached</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-teal-200 text-teal-900 text-[10px] font-bold">Auto Verification</span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-md shadow-teal-600/20"
            >
              Issue Digital Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
