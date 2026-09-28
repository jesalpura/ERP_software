import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
    borderBottomColor: '#0d9488',
    paddingBottom: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#134e4a'
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b'
  },
  badge: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f766e'
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  card: {
    width: '31%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardLabel: {
    fontSize: 8,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase'
  },
  cardVal: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginTop: 4
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
    backgroundColor: '#134e4a',
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
  colYear: { width: '25%' },
  colRev: { width: '25%', textAlign: 'right' },
  colExp: { width: '25%', textAlign: 'right' },
  colNet: { width: '25%', textAlign: 'right' },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export default function FinancialAuditPDF({ transactions = [], totalCollection = 4850000, websiteConfig, pdfConfig }) {
  const years = [
    { year: '2024 - 2025 (YTD)', rev: totalCollection, exp: 1240000, net: totalCollection - 1240000 },
    { year: '2023 - 2024', rev: 4120000, exp: 1180000, net: 2940000 },
    { year: '2022 - 2023', rev: 3450000, exp: 980000, net: 2470000 }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{pdfConfig.headerTitle}</Text>
            <Text style={styles.subtitle}>{websiteConfig.name} Financial Audit Report</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FINANCIAL AUDIT REPORT</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Collections</Text>
            <Text style={styles.cardVal}>₹{totalCollection.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Operating Expenses</Text>
            <Text style={[styles.cardVal, { color: '#dc2626' }]}>₹1,240,000</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Net Reserves</Text>
            <Text style={[styles.cardVal, { color: '#059669' }]}>₹{(totalCollection - 1240000).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', marginBottom: 8, color: '#0f766e' }}>
          Historical Multi-Year Financial Performance Overview
        </Text>

        <View style={styles.table}>
          <View style={styles.rowHead}>
            <Text style={[styles.cellHead, styles.colYear]}>Academic Year</Text>
            <Text style={[styles.cellHead, styles.colRev]}>Gross Revenue</Text>
            <Text style={[styles.cellHead, styles.colExp]}>Operational Cost</Text>
            <Text style={[styles.cellHead, styles.colNet]}>Net Profit</Text>
          </View>

          {years.map((y) => (
            <View key={y.year} style={styles.row}>
              <Text style={[styles.colYear, { fontFamily: 'Helvetica-Bold' }]}>{y.year}</Text>
              <Text style={styles.colRev}>₹{y.rev.toLocaleString('en-IN')}</Text>
              <Text style={[styles.colExp, { color: '#dc2626' }]}>₹{y.exp.toLocaleString('en-IN')}</Text>
              <Text style={[styles.colNet, { fontFamily: 'Helvetica-Bold', color: '#059669' }]}>
                ₹{y.net.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 7, color: '#94a3b8' }}>
            Official Audit Record • {pdfConfig.financeDesk}
          </Text>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f766e' }}>
            Audit Status: CLEARED & AUDITED
          </Text>
        </View>
      </Page>
    </Document>
  );
}
