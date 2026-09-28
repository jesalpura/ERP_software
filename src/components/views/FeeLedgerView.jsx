import React, { useState } from 'react';
import { Wallet, Search, Eye, PlusCircle, ShieldCheck, QrCode } from 'lucide-react';

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

  const modeColor = (mode) => {
    if (mode.includes('UPI'))         return 'bg-emerald-100 text-emerald-700';
    if (mode.includes('Cash'))        return 'bg-amber-100 text-amber-700';
    if (mode.includes('Net Banking')) return 'bg-blue-100 text-blue-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="flex flex-col gap-5 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            Fee Ledger &amp; Digital Receipt Generator <Wallet className="w-5 h-5 text-blue-600 shrink-0" />
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Official financial transaction log, digital voucher entry, and audit trail</p>
        </div>
        <button
          onClick={onOpenCollectFee}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>New Fee Collection</span>
        </button>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Total Ledger Collection</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">&#8377;{totalCollected.toLocaleString('en-IN')}</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">&#8377;</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">UPI / Online Digital Share</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">78%</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase">Verified Audit Vouchers</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{transactions.length} Receipts</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTx}
            onChange={(e) => setSearchTx(e.target.value)}
            placeholder="Search by receipt #, student name..."
            className="w-full h-9 pl-10 pr-4 rounded-xl bg-slate-100 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Payment mode filters — horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap shrink-0">Mode:</span>
          {['All', 'UPI', 'Cash', 'Net Banking'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
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

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">

        {/* Desktop table (sm and above) */}
        <div className="hidden sm:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Voucher #</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Course</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Installment</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Timestamp</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTx.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-blue-600 whitespace-nowrap">{t.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">{t.studentName}</td>
                  <td className="py-3.5 px-4 text-slate-600 hidden md:table-cell">{t.course}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-lg font-medium text-xs whitespace-nowrap ${modeColor(t.mode)}`}>
                      {t.mode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 hidden lg:table-cell whitespace-nowrap">{t.installment}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">&#8377;{t.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 text-slate-400 hidden lg:table-cell whitespace-nowrap">{t.timestamp}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
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

        {/* Mobile card list (below sm) */}
        <div className="sm:hidden flex flex-col divide-y divide-slate-100">
          {filteredTx.length === 0 && (
            <p className="py-8 text-center text-xs text-slate-400 italic">No transactions match your filter.</p>
          )}
          {filteredTx.map((t) => (
            <div key={t.id} className="p-4 flex flex-col gap-2.5">
              {/* Voucher + Amount row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono font-bold text-blue-600 text-xs">{t.id}</span>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5 truncate">{t.studentName}</p>
                  <p className="text-slate-500 text-xs truncate">{t.course}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-900 text-base">&#8377;{t.amount.toLocaleString('en-IN')}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{t.installment}</p>
                </div>
              </div>

              {/* Mode + Date + Receipt button row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`px-2 py-0.5 rounded-lg font-medium text-[11px] whitespace-nowrap shrink-0 ${modeColor(t.mode)}`}>
                    {t.mode}
                  </span>
                  <span className="text-slate-400 text-[11px] truncate">{t.timestamp}</span>
                </div>
                <button
                  onClick={() => onViewReceipt(t)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 shrink-0" /> Receipt
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

