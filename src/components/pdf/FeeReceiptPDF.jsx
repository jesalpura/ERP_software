import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { useSiteConfig } from '../../context/SiteConfigContext';

// Create PDF Styles for Fee Receipt
const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 12,
    marginBottom: 16
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a'
  },
  brandSubtitle: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 2
  },
  receiptBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    alignItems: 'flex-end'
  },
  receiptTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8'
  },
  receiptNo: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginTop: 2
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  metaColumn: {
    flexDirection: 'column',
    gap: 4
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold'
  },
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a'
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  cellDesc: {
    width: '45%'
  },
  cellMode: {
    width: '25%'
  },
  cellAmount: {
    width: '30%',
    textAlign: 'right'
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20
  },
  totalBox: {
    width: '45%',
    backgroundColor: '#ecfdf5',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  totalLabel: {
    fontSize: 10,
    color: '#065f46',
    fontFamily: 'Helvetica-Bold'
  },
  totalAmount: {
    fontSize: 14,
    color: '#047857',
    fontFamily: 'Helvetica-Bold'
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#059669',
    color: '#ffffff',
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  signBox: {
    textAlign: 'center',
    width: 140
  },
  signLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginBottom: 4,
    height: 30
  },
  signText: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold'
  },
  disclaimer: {
    fontSize: 7,
    color: '#94a3b8',
    maxWidth: 260
  }
});

export default function FeeReceiptPDF({ transaction }) {
  const { websiteConfig, pdfConfig } = useSiteConfig();
  if (!transaction) return null;

  const receiptNo = transaction.id || `REC-${Math.floor(10000 + Math.random() * 90000)}`;
  const studentName = transaction.studentName || 'Student Name';
  const studentId = transaction.studentId || 'AT-2024-001';
  const course = transaction.course || 'Full Stack Web Development';
  const amount = transaction.amount || 0;
  const dateStr = transaction.timestamp || new Date().toLocaleDateString('en-IN');
  const mode = transaction.mode || 'Online Banking / UPI';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Branding */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.brandName}>{pdfConfig.headerTitle}</Text>
            <Text style={styles.brandSubtitle}>{websiteConfig.name} Fees Ledger & Accounting Receipt</Text>
            <Text style={styles.brandSubtitle}>{websiteConfig.accreditation} • GSTIN: {websiteConfig.gstin}</Text>
          </View>
          <View style={styles.receiptBadge}>
            <Text style={styles.receiptTitle}>PAYMENT RECEIPT</Text>
            <Text style={styles.receiptNo}>Receipt #: {receiptNo}</Text>
            <Text style={{ fontSize: 8, color: '#475569', marginTop: 2 }}>Date: {dateStr}</Text>
          </View>
        </View>

        {/* Student & Payment Metadata */}
        <View style={styles.metaGrid}>
          <View style={styles.metaColumn}>
            <Text style={styles.label}>Student Name:</Text>
            <Text style={styles.value}>{studentName}</Text>

            <Text style={[styles.label, { marginTop: 6 }]}>Student Roll No / ID:</Text>
            <Text style={styles.value}>{studentId}</Text>
          </View>

          <View style={styles.metaColumn}>
            <Text style={styles.label}>Enrolled Course:</Text>
            <Text style={styles.value}>{course}</Text>

            <Text style={[styles.label, { marginTop: 6 }]}>Payment Mode:</Text>
            <Text style={styles.value}>{mode}</Text>
          </View>

          <View style={styles.metaColumn}>
            <Text style={styles.label}>Verification Status:</Text>
            <Text style={styles.statusBadge}>VERIFIED & CLEARED</Text>

            <Text style={[styles.label, { marginTop: 6 }]}>Academic Session:</Text>
            <Text style={styles.value}>2024 - 2025 (Term 2)</Text>
          </View>
        </View>

        {/* Table of Particulars */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.cellDesc]}>Particulars / Fee Description</Text>
            <Text style={[styles.tableHeaderCell, styles.cellMode]}>Payment Method</Text>
            <Text style={[styles.tableHeaderCell, styles.cellAmount]}>Amount (INR)</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.cellDesc, { fontFamily: 'Helvetica-Bold' }]}>
              {course} - Tuition & Practical Lab Fee Installment
            </Text>
            <Text style={styles.cellMode}>{mode}</Text>
            <Text style={[styles.cellAmount, { fontFamily: 'Helvetica-Bold' }]}>
              ₹{amount.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.cellDesc}>Library & Digital Access Subscription</Text>
            <Text style={styles.cellMode}>Included</Text>
            <Text style={styles.cellAmount}>₹0.00</Text>
          </View>
        </View>

        {/* Total Box */}
        <View style={styles.totalContainer}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Received:</Text>
              <Text style={styles.totalAmount}>₹{amount.toLocaleString('en-IN')}</Text>
            </View>
            <Text style={{ fontSize: 8, color: '#047857' }}>Payment Status: SUCCESS</Text>
          </View>
        </View>

        {/* Footer & Authorized Signature */}
        <View style={styles.footer}>
          <Text style={styles.disclaimer}>
            {pdfConfig.verificationDisclaimer}
          </Text>

          <View style={styles.signBox}>
            <View style={styles.signLine} />
            <Text style={styles.signText}>Authorized Accounts Officer</Text>
            <Text style={{ fontSize: 7, color: '#94a3b8' }}>{pdfConfig.financeDesk}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
