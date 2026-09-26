import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useSiteConfig } from '../../context/SiteConfigContext';

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#312e81'
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b'
  },
  payslipBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#3730a3'
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  col: {
    gap: 4
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase'
  },
  val: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b'
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginBottom: 16
  },
  rowHead: {
    flexDirection: 'row',
    backgroundColor: '#312e81',
    padding: 8
  },
  cellHead: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8
  },
  colDesc: { width: '50%' },
  colCat: { width: '25%' },
  colAmt: { width: '25%', textAlign: 'right' },
  totalContainer: {
    alignSelf: 'flex-end',
    width: '50%',
    backgroundColor: '#f0fdf4',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  netLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#166534'
  },
  netVal: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#15803d'
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  }
});

export default function FacultyPayslipPDF({ faculty }) {
  const { websiteConfig, pdfConfig } = useSiteConfig();
  const name = faculty?.name || 'Dr. Rajesh Verma';
  const role = faculty?.role || 'Senior Professor';
  const subject = faculty?.subject || 'Full Stack Web Dev';
  const baseSalary = faculty?.salary || 85000;
  const honorarium = faculty?.honorarium || 24000;
  const gross = baseSalary + honorarium;
  const tds = Math.round(gross * 0.1);
  const netPay = gross - tds;
  const monthYear = 'October 2024';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{pdfConfig.headerTitle}</Text>
            <Text style={styles.subtitle}>{websiteConfig.name} Salary Slip</Text>
          </View>
          <View style={styles.payslipBadge}>
            <Text style={styles.badgeText}>PAYSLIP FOR {monthYear.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.col}>
            <Text style={styles.label}>Faculty Instructor:</Text>
            <Text style={styles.val}>{name}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Designation:</Text>
            <Text style={styles.val}>{role}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Primary Department:</Text>
            <Text style={styles.val}>{subject}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Pay Period:</Text>
            <Text style={styles.val}>{monthYear}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Disbursement Status:</Text>
            <Text style={[styles.val, { color: faculty?.disbursed ? '#059669' : '#d97706' }]}>
              {faculty?.disbursed ? 'PAID & BANK TRANSFERRED' : 'PENDING CLEARANCE'}
            </Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.rowHead}>
            <Text style={[styles.cellHead, styles.colDesc]}>Earnings Component</Text>
            <Text style={[styles.cellHead, styles.colCat]}>Category</Text>
            <Text style={[styles.cellHead, styles.colAmt]}>Amount (INR)</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Monthly Base Salary</Text>
            <Text style={styles.colCat}>Fixed Pay</Text>
            <Text style={[styles.colAmt, { fontFamily: 'Helvetica-Bold' }]}>₹{baseSalary.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={[styles.colDesc, { fontFamily: 'Helvetica-Bold' }]}>Practical Lab Sessions Honorarium</Text>
            <Text style={styles.colCat}>Variable (42 Sessions)</Text>
            <Text style={[styles.colAmt, { fontFamily: 'Helvetica-Bold' }]}>₹{honorarium.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.colDesc}>TDS Tax Deduction (10%)</Text>
            <Text style={styles.colCat}>Deduction</Text>
            <Text style={[styles.colAmt, { color: '#dc2626' }]}>- ₹{tds.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <View style={styles.netRow}>
            <Text style={styles.netLabel}>Net Disbursed Pay:</Text>
            <Text style={styles.netVal}>₹{netPay.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 7, color: '#94a3b8', maxWidth: 260 }}>
            Computer generated payroll statement. Verified by {pdfConfig.financeDesk}.
          </Text>
          <View style={{ textAlign: 'center' }}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#94a3b8', marginBottom: 3, height: 20 }} />
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#475569' }}>Finance Controller</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
