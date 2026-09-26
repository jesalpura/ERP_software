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
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4
  },
  badgeText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1e40af'
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
    color: '#0f172a'
  },
  scheduleBox: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#eff6ff'
  },
  schTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    marginBottom: 6
  },
  instructions: {
    borderWidth: 1,
    borderColor: '#fed7aa',
    backgroundColor: '#fff7ed',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20
  },
  instTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#c2410c',
    marginBottom: 4
  },
  instItem: {
    fontSize: 8,
    color: '#9a3412',
    marginBottom: 2
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

export default function ExamAdmitCardPDF({ student }) {
  const { websiteConfig, pdfConfig } = useSiteConfig();
  const name = student?.name || 'Rohan Adhikari';
  const id = student?.id || 'AT-2024-089';
  const course = student?.course || 'MERN Stack Web Dev';
  const batch = student?.batch || 'Batch A-1';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{pdfConfig.headerTitle}</Text>
            <Text style={styles.subtitle}>{websiteConfig.name} Examination Hall Ticket</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>EXAMINATION ADMIT CARD</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.col}>
            <Text style={styles.label}>Student Candidate:</Text>
            <Text style={styles.val}>{name}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Roll Number / ID:</Text>
            <Text style={styles.val}>{id}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Enrolled Course:</Text>
            <Text style={styles.val}>{course}</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Assigned Batch:</Text>
            <Text style={styles.val}>{batch}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Seat Allocation:</Text>
            <Text style={[styles.val, { color: '#2563eb' }]}>PC Terminal #08 (Lab 1)</Text>
            <Text style={[styles.label, { marginTop: 4 }]}>Eligibility Clearance:</Text>
            <Text style={[styles.val, { color: '#059669' }]}>VERIFIED & ELIGIBLE</Text>
          </View>
        </View>

        <View style={styles.scheduleBox}>
          <Text style={styles.schTitle}>Upcoming Practical Examination Timetable</Text>
          <Text style={{ fontSize: 9, color: '#334155', marginBottom: 2 }}>
            • Exam Subject: <Text style={{ fontFamily: 'Helvetica-Bold' }}>Full-Stack REST API & Database Practical Evaluation</Text>
          </Text>
          <Text style={{ fontSize: 9, color: '#334155', marginBottom: 2 }}>
            • Date & Time: <Text style={{ fontFamily: 'Helvetica-Bold' }}>Friday, Oct 28, 2024 (09:30 AM - 01:30 PM)</Text>
          </Text>
          <Text style={{ fontSize: 9, color: '#334155' }}>
            • Examination Venue: <Text style={{ fontFamily: 'Helvetica-Bold' }}>Computer Lab 1 (Workstation PC-08)</Text>
          </Text>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instTitle}>Mandatory Candidate Instructions:</Text>
          <Text style={styles.instItem}>1. Candidates must report to Computer Lab 1 at least 15 minutes before exam start time.</Text>
          <Text style={styles.instItem}>2. Carry this printed Admit Card & Official Academy Student ID Card for verification.</Text>
          <Text style={styles.instItem}>3. Internet access during exam is strictly monitored via ERP firewall logs.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={{ fontSize: 7, color: '#94a3b8' }}>
            {pdfConfig.footerNotice}
          </Text>
          <View style={{ textAlign: 'center' }}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#94a3b8', marginBottom: 3, height: 20 }} />
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#334155' }}>Chief Controller of Examinations</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
