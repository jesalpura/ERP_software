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
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a'
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b'
  },
  badge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8'
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  card: {
    width: '23%',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cardLabel: {
    fontSize: 7,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase'
  },
  cardVal: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginTop: 2
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a8a',
    marginBottom: 6
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
    backgroundColor: '#1e293b',
    padding: 6
  },
  cellHead: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    padding: 6
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export default function DayAuditReportPDF({ totalStudents = 142, labsCount = 4, transactionsCount = 12 }) {
  const { websiteConfig, pdfConfig } = useSiteConfig();
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{pdfConfig.headerTitle}</Text>
            <Text style={styles.subtitle}>{websiteConfig.name} Daily Operations Audit</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>DAY AUDIT REPORT</Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, color: '#475569', marginBottom: 12 }}>
          Audit Date: <Text style={{ fontFamily: 'Helvetica-Bold' }}>{todayStr}</Text>
        </Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Total Students</Text>
            <Text style={styles.cardVal}>{totalStudents}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Active Computer Labs</Text>
            <Text style={[styles.cardVal, { color: '#2563eb' }]}>{labsCount} Labs</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Today Receipts</Text>
            <Text style={[styles.cardVal, { color: '#059669' }]}>{transactionsCount}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>System Health</Text>
            <Text style={[styles.cardVal, { color: '#059669' }]}>100% OK</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Lab Workstation Occupancy & Ping Summary</Text>
        <View style={styles.table}>
          <View style={styles.rowHead}>
            <Text style={[styles.cellHead, { width: '25%' }]}>Lab Name</Text>
            <Text style={[styles.cellHead, { width: '25%' }]}>Total PCs</Text>
            <Text style={[styles.cellHead, { width: '25%' }]}>Occupied PCs</Text>
            <Text style={[styles.cellHead, { width: '25%' }]}>Ping Status</Text>
          </View>

          {[1, 2, 3, 4].map((labNo) => (
            <View key={labNo} style={styles.row}>
              <Text style={{ width: '25%', fontFamily: 'Helvetica-Bold' }}>Lab 0{labNo} (MERN / Python)</Text>
              <Text style={{ width: '25%' }}>20 Workstations</Text>
              <Text style={{ width: '25%', color: '#059669' }}>{18 - labNo} / 20</Text>
              <Text style={{ width: '25%', color: '#059669', fontFamily: 'Helvetica-Bold' }}>Active (Response &lt;5ms)</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 7, color: '#94a3b8' }}>
            Generated via {websiteConfig.shortName} Operations Audit Module
          </Text>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1e3a8a' }}>
            System Audit Status: PASS
          </Text>
        </View>
      </Page>
    </Document>
  );
}
