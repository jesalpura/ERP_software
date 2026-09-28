import React, { useState } from 'react';
import { Wallet, Search, Filter, Printer, Download, Eye, PlusCircle, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export default function FeeLedgerView({ transactions, students, onViewReceipt, onOpenCollectFee }) {
  const [filterMode, setFilterMode] = useState('All');
  const [searchTx, setSearchTx] = useState('');

  const filteredTx = transactions.filter((t) => {
    const matchesSearch = 
      t.studentName.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.studentId.toLowerCase().includes(searchTx.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTx.toLowerCase());
    const matchesMode = filterMode === 'All' || t.mode.includes(filterMode);
    return matchesSearch && matchesMode;
  });

  const totalCollected = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Fee Ledger & Digital Receipt Generator <Wallet className="w-5 h-5 text-blue-600" />
          </h1>
          <p className="text-xs text-slate-500 mt-1">Official financial transaction log, digital voucher entry, and audit trail</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCollectFee}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Fee Collection</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Ledger Collection</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalCollected.toLocaleString('en-IN')}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">UPI / Online Digital Share</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">78%</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Verified Audit Vouchers</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{transactions.length} Receipts</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTx}
            onChange={(e) => setSearchTx(e.target.value)}
            placeholder="Search by receipt #, student name..."
            className="w-full h-9 pl-10 pr-4 rounded-xl bg-slate-100 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">Payment Mode:</span>
          {['All', 'UPI', 'Cash', 'Net Banking'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                filterMode === mode
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-6">Voucher #</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Installment</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-6 text-right">Receipt Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTx.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-blue-600">{t.id}</td>
                  <td className="py-4 px-4 font-semibold text-slate-900">{t.studentName}</td>
                  <td className="py-4 px-4 text-slate-600">{t.course}</td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-700">
                      {t.mode}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{t.installment}</td>
                  <td className="py-4 px-4 font-bold text-slate-900 text-sm">₹{t.amount.toLocaleString('en-IN')}</td>
                  <td className="py-4 px-4 text-slate-400">{t.timestamp}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onViewReceipt(t)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" /> View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
