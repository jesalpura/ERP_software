import React, { useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import SiteLogo from '../common/SiteLogo';
import { X, Printer, ShieldCheck, Download } from 'lucide-react';
import FeeReceiptPDF from '../pdf/FeeReceiptPDF';
import PDFDownloadButton from '../pdf/PDFDownloadButton';
import pdfLibService from '../../services/pdfLibService';

export default function ReceiptPreviewModal({ isOpen, onClose, transaction }) {
  const { websiteConfig } = useSiteConfig();
  const [generatingPdfLib, setGeneratingPdfLib] = useState(false);
  if (!isOpen || !transaction) return null;

  const handleDownloadPdfLibReceipt = async () => {
    setGeneratingPdfLib(true);
    try {
      const pdfBytes = await pdfLibService.generateReceipt({
        studentName: transaction.studentName || 'Student Name',
        studentId: transaction.studentId || 'AT-2024-001',
        course: transaction.course || 'Full Stack Web Development',
        receiptNo: transaction.id || `REC-99482`,
        amount: transaction.amount || 0,
        dateStr: transaction.timestamp || new Date().toLocaleDateString('en-IN'),
        mode: transaction.mode || 'Online Banking / GPay',
        institutionName: websiteConfig.name,
        address: websiteConfig.address,
        gstin: websiteConfig.gstin,
        logoUrl: websiteConfig.logo?.imageUrl || '/logo.png'
      });
      pdfLibService.downloadPdfBytes(pdfBytes, `Receipt_${transaction.id || 'voucher'}_pdf-lib.pdf`);
    } catch (err) {
      console.error('Error generating pdf-lib receipt:', err);
    } finally {
      setGeneratingPdfLib(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">Official Digital Fee Voucher Receipt</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Voucher Body */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-900 bg-white relative overflow-hidden">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none font-bold text-8xl rotate-[-25deg]">
            {websiteConfig.shortName.toUpperCase()} ERP
          </div>

          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div className="flex items-start gap-3">
              <SiteLogo imageClassName="h-12 w-12 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0 mt-0.5" />
              <div>
                <h2 className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                  {websiteConfig.name}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">{websiteConfig.address} • GSTIN: {websiteConfig.gstin}</p>
                <p className="text-[11px] text-slate-500">{websiteConfig.accreditation}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full inline-block mb-1">
                PAID & VERIFIED
              </span>
              <div className="font-mono text-xs font-bold text-blue-600">{transaction.id}</div>
              <div className="text-[11px] text-slate-400">{transaction.timestamp}</div>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{transaction.studentName}</span>
              <span className="text-slate-500 font-mono block text-[11px] mt-0.5">ID: {transaction.studentId}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Course Program</span>
              <span className="font-bold text-slate-900">{transaction.course}</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Mode: {transaction.mode}</span>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2 text-left">Description</th>
                <th className="py-2 text-center">Installment</th>
                <th className="py-2 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-3 text-slate-900 font-semibold">{transaction.course} Tuition Deposit</td>
                <td className="py-3 text-center text-slate-500">{transaction.installment}</td>
                <td className="py-3 text-right font-bold text-slate-900 text-sm">₹{transaction.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <div className="text-xs">
              <span className="text-slate-500">Remarks: </span>
              <span className="font-medium text-slate-700">{transaction.remarks || 'Cleared'}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Total Amount Received</span>
              <span className="text-2xl font-extrabold text-emerald-600">₹{transaction.amount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Stamp Seal Footer */}
          <div className="pt-6 flex justify-between items-end border-t border-dashed border-slate-200 text-[11px] text-slate-400">
            <div>
              <div>System Issued Digital Voucher</div>
              <div>Computer Generated • No Physical Signature Needed</div>
            </div>
            <div className="text-center">
              <div className="h-10 w-24 border-2 border-emerald-600/30 text-emerald-600/60 font-bold text-[10px] flex items-center justify-center rounded-lg rotate-[-5deg] mb-1">
                SEAL APPROVED
              </div>
              <span className="font-semibold text-slate-600">Accounts Officer</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-slate-500 font-medium">Verified PDF Document ✓</span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPdfLibReceipt}
              disabled={generatingPdfLib}
              className="px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{generatingPdfLib ? 'Generating…' : 'pdf-lib PDF'}</span>
            </button>
            <PDFDownloadButton
              document={<FeeReceiptPDF transaction={transaction} />}
              fileName={`Receipt_${transaction.id || 'voucher'}.pdf`}
              buttonText="Vector PDF"
              variant="indigo"
            />
            <button
              onClick={handlePrint}
              className="px-3.5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
