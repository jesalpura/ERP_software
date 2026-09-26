import React, { useState, lazy, Suspense } from 'react';

// Lazy-load heavy view/PDF chunks
const FeeLedgerView      = lazy(() => import('../views/FeeLedgerView'));
const FacultyPayrollView = lazy(() => import('../views/FacultyPayrollView'));
const FinancialAuditPDF  = lazy(() => import('../pdf/FinancialAuditPDF'));
import PDFDownloadButton from '../pdf/PDFDownloadButton';
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Download, 
  PlusCircle, 
  CreditCard, 
  Receipt,
  BarChart3,
  ArrowUpRight,
  Calendar,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function FinanceDashboard({
  transactions,
  students,
  faculty,
  expenses,
  activeTab: parentActiveTab,
  setActiveTab: parentSetActiveTab,
  onViewReceipt,
  onOpenCollectFee,
  onUpdateFacultyDisbursement,
  onDisburseAllFaculty
}) {
  const validTabIds = ['overview', 'yearly-growth', 'student-collections', 'faculty-payroll', 'expense-ledger'];
  const [internalTab, setInternalTab] = useState('overview');

  const currentTab = parentActiveTab && validTabIds.includes(parentActiveTab)
    ? parentActiveTab
    : (validTabIds.includes(internalTab) ? internalTab : 'overview');

  const handleTabChange = (tabId) => {
    setInternalTab(tabId);
    if (parentSetActiveTab) {
      parentSetActiveTab(tabId);
    }
  };

  const financeTabs = [
    { id: 'overview', label: 'Cash Flow & Overview', icon: TrendingUp },
    { id: 'yearly-growth', label: 'Yearly Growth & Analytics', icon: BarChart3 },
    { id: 'student-collections', label: 'Student Fee Collections', icon: Wallet },
    { id: 'faculty-payroll', label: 'Faculty Payroll & Honorarium', icon: DollarSign },
    { id: 'expense-ledger', label: 'Expense Ledger & Audit', icon: ShieldCheck },
  ];

  const totalFeeCollected = transactions.reduce((acc, t) => acc + t.amount, 0) + 319000;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netSurplus = totalFeeCollected - totalExpenses;

  // Multi-Year Financial Performance Dataset
  const yearlyGrowthData = [
    {
      year: 'FY 2021-22',
      grossRevenue: 1850000,
      expenses: 1320000,
      netSurplus: 530000,
      studentsEnrolled: 85,
      growthPct: '+24.5%',
      topCourse: 'Tally & Accounting',
      status: 'Audited'
    },
    {
      year: 'FY 2022-23',
      grossRevenue: 2620000,
      expenses: 1680000,
      netSurplus: 940000,
      studentsEnrolled: 125,
      growthPct: '+41.6%',
      topCourse: 'Web Development',
      status: 'Audited'
    },
    {
      year: 'FY 2023-24',
      grossRevenue: 3800000,
      expenses: 2320000,
      netSurplus: 1480000,
      studentsEnrolled: 168,
      growthPct: '+45.0%',
      topCourse: 'MERN Full Stack',
      status: 'Audited'
    },
    {
      year: 'FY 2024-25 (Est)',
      grossRevenue: 5240000,
      expenses: 2950000,
      netSurplus: 2290000,
      studentsEnrolled: 204,
      growthPct: '+37.8%',
      topCourse: 'MERN & Data Analytics',
      status: 'Current Cycle'
    }
  ];

  const maxRevenue = Math.max(...yearlyGrowthData.map((d) => d.grossRevenue));

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Role Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            FN
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Finance & Accounts Command Center</h2>
            <p className="text-xs text-slate-500">Real-time revenue ledgers, multi-year growth analytics, student fee collections, and payroll audit</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCollectFee}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Issue E-Voucher Receipt</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 scrollbar-none">
        {financeTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CASH FLOW & OVERVIEW */}
      {currentTab === 'overview' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Gross Collections</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">₹{totalFeeCollected.toLocaleString('en-IN')}</div>
              <div className="text-xs text-emerald-600 font-medium mt-1">+18% MoM Growth</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Operating Expenses</span>
              <div className="text-3xl font-extrabold text-rose-600 mt-1">₹{totalExpenses.toLocaleString('en-IN')}</div>
              <div className="text-xs text-slate-500 mt-1">Electricity, Licenses & Supplies</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase">Net Operating Surplus</span>
              <div className="text-3xl font-extrabold text-teal-600 mt-1">₹{netSurplus.toLocaleString('en-IN')}</div>
              <div className="text-xs text-teal-700 font-medium mt-1">Positive Net Reserve</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: YEARLY GROWTH & ANALYTICS */}
      {currentTab === 'yearly-growth' && (
        <div className="flex flex-col gap-6">
          {/* Key Multi-Year Performance Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">4-Year Total Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">₹1.35 Cr</div>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +183% Gross Expansion
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Revenue CAGR</span>
                <Sparkles className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold text-teal-600 mt-2">41.5% p.a.</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 block">Compound Annual Growth Rate</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Enrollment Expansion</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2">204 Students</div>
              <span className="text-[11px] text-blue-600 font-bold mt-1 block">From 85 in FY 2021 (+140%)</span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Net Profit Margin</span>
                <PieChart className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-600 mt-2">43.7% Margin</div>
              <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Up from 28.6% in 2021</span>
            </div>
          </div>

          {/* Visual Year-over-Year Revenue & Net Surplus Chart View */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Year-over-Year (YoY) Financial Growth Chart <BarChart3 className="w-4 h-4 text-teal-600" />
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Comparative annual gross revenue, operational expenditures, and net profit surplus</p>
              </div>
              <Suspense fallback={<span className="text-xs text-slate-400">Preparing PDF…</span>}>
                <PDFDownloadButton
                  document={<FinancialAuditPDF totalCollection={totalFeeCollected} />}
                  fileName="Institutional_Financial_Audit_Report_2024.pdf"
                  buttonText="Download Audit PDF"
                  variant="emerald"
                />
              </Suspense>
            </div>

            {/* Visual Bar Graph */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
              {yearlyGrowthData.map((d) => {
                const heightPct = Math.round((d.grossRevenue / maxRevenue) * 100);
                return (
                  <div key={d.year} className="flex flex-col gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900">{d.year}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        {d.growthPct} YoY
                      </span>
                    </div>

                    {/* Bar visualization container */}
                    <div className="h-44 bg-slate-200/60 rounded-xl p-2 flex items-end justify-between gap-2 relative overflow-hidden">
                      {/* Revenue Bar */}
                      <div 
                        className="bg-gradient-to-t from-teal-600 to-teal-400 w-1/2 rounded-lg transition-all duration-700 shadow-sm flex flex-col justify-end p-1 text-[9px] text-white font-mono font-bold"
                        style={{ height: `${heightPct}%` }}
                        title={`Gross Revenue: ₹${d.grossRevenue.toLocaleString('en-IN')}`}
                      >
                        <span className="truncate">₹{(d.grossRevenue / 100000).toFixed(1)}L</span>
                      </div>

                      {/* Net Surplus Bar */}
                      <div 
                        className="bg-gradient-to-t from-blue-600 to-indigo-500 w-1/2 rounded-lg transition-all duration-700 shadow-sm flex flex-col justify-end p-1 text-[9px] text-white font-mono font-bold"
                        style={{ height: `${Math.round((d.netSurplus / maxRevenue) * 100)}%` }}
                        title={`Net Surplus: ₹${d.netSurplus.toLocaleString('en-IN')}`}
                      >
                        <span className="truncate">₹{(d.netSurplus / 100000).toFixed(1)}L</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs pt-1 border-t border-slate-200">
                      <div className="flex justify-between text-slate-600">
                        <span>Gross Rev:</span>
                        <strong className="text-slate-900">₹{d.grossRevenue.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Expenses:</span>
                        <strong className="text-rose-600">₹{d.expenses.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Net Profit:</span>
                        <strong className="text-teal-700">₹{d.netSurplus.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[11px] pt-1">
                        <span>Students: <strong>{d.studentsEnrolled}</strong></span>
                        <span className="text-teal-600 font-semibold">{d.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Financial Audit Table Across Fiscal Years */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Fiscal Years Comparative Financial Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">Audited annual financial statements & growth trajectory</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                4 Fiscal Cycles Tracked
              </span>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Fiscal Year</th>
                    <th className="py-3 px-4">Enrolled Students</th>
                    <th className="py-3 px-4">Gross Revenue</th>
                    <th className="py-3 px-4">Operating Cost</th>
                    <th className="py-3 px-4">Net Surplus</th>
                    <th className="py-3 px-4">YoY Growth %</th>
                    <th className="py-3 px-4">Top Revenue Driver</th>
                    <th className="py-3 px-6 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {yearlyGrowthData.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-900">{row.year}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{row.studentsEnrolled} Active</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">₹{row.grossRevenue.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-semibold text-rose-600">₹{row.expenses.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4 font-extrabold text-teal-700">₹{row.netSurplus.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[11px]">
                          {row.growthPct}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{row.topCourse}</td>
                      <td className="py-3.5 px-6 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          row.status === 'Audited' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT FEE COLLECTIONS */}
      {currentTab === 'student-collections' && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-teal-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <FeeLedgerView
            transactions={transactions}
            students={students}
            onViewReceipt={onViewReceipt}
            onOpenCollectFee={onOpenCollectFee}
          />
        </Suspense>
      )}

      {/* TAB 3: FACULTY PAYROLL */}
      {currentTab === 'faculty-payroll' && (
        <Suspense fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <FacultyPayrollView
            faculty={faculty}
            onUpdateFacultyDisbursement={onUpdateFacultyDisbursement}
            onDisburseAllFaculty={onDisburseAllFaculty}
          />
        </Suspense>
      )}

      {/* TAB 4: EXPENSE LEDGER */}
      {currentTab === 'expense-ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Operational Expense Audit Ledger</h3>
            <button onClick={() => alert('Expense voucher recorded.')} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200">
              + Log New Expense
            </button>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-6">Voucher #</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-6 font-mono font-bold text-teal-600">{exp.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{exp.category}</td>
                    <td className="py-3.5 px-4 text-slate-600">{exp.description}</td>
                    <td className="py-3.5 px-4 text-slate-500">{exp.vendor}</td>
                    <td className="py-3.5 px-4 font-bold text-rose-600">₹{exp.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-emerald-600">{exp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
