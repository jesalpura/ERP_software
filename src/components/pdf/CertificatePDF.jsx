import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { certificateConfig as defaultConfig } from '../../config/siteConfig';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: defaultConfig.theme?.backgroundColor || '#fffbeb',
    color: '#1e293b'
  },
  borderOuter: {
    borderWidth: 4,
    borderColor: defaultConfig.theme?.borderColorPrimary || '#d97706',
    padding: 16,
    height: '100%',
    borderRadius: 8
  },
  borderInner: {
    borderWidth: 1.5,
    borderColor: defaultConfig.theme?.borderColorSecondary || '#b45309',
    padding: 24,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: 10
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: defaultConfig.theme?.titleColor || '#92400e',
    letterSpacing: 2,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 12,
    color: defaultConfig.theme?.borderColorSecondary || '#b45309',
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1
  },
  divider: {
    width: 120,
    height: 2,
    backgroundColor: defaultConfig.theme?.borderColorPrimary || '#d97706',
    marginVertical: 12
  },
  presentText: {
    fontSize: 11,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10
  },
  studentName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: defaultConfig.theme?.studentNameColor || '#1e1b4b',
    borderBottomWidth: 1,
    borderBottomColor: defaultConfig.theme?.borderColorPrimary || '#d97706',
    paddingBottom: 4,
    marginBottom: 12,
    minWidth: 260,
    textAlign: 'center'
  },
  description: {
    fontSize: 11,
    color: '#334155',
    lineHeight: 1.5,
    maxWidth: 420,
    textAlign: 'center',
    marginBottom: 16
  },
  courseName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: defaultConfig.theme?.courseColor || '#4338ca'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20
  },
  signBlock: {
    alignItems: 'center',
    width: 140
  },
  signLine: {
    width: 120,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    marginBottom: 4,
    height: 24
  },
  signRole: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#334155'
  },
  meta: {
    fontSize: 8,
    color: '#94a3b8'
  }
});

export default function CertificatePDF({ student, certificateType }) {
  const { certificateConfig: siteCertConfig } = useSiteConfig();
  const certificateConfig = siteCertConfig || defaultConfig;
  const certTypeToUse = certificateType || certificateConfig.defaultCertType || 'Course Completion';
  const name = student?.name || 'Rohan Adhikari';
  const course = student?.course || 'MERN Stack Full-Stack Web Development';
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const certId = `${certificateConfig.serialPrefix || 'CERT-'}${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.borderInner}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{certificateConfig.institutionName}</Text>
              <Text style={styles.subtitle}>CERTIFICATE OF {certTypeToUse.toUpperCase()}</Text>
              <View style={styles.divider} />
            </View>

            {/* Recipient */}
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.presentText}>This is proudly presented to</Text>
              <Text style={styles.studentName}>{name}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              for successfully completing the advanced industry curriculum in{' '}
              <Text style={styles.courseName}>{course}</Text> with outstanding performance in live project demonstrations, code reviews, and practical evaluations.
            </Text>

            {/* Signatures & Verification */}
            <View style={styles.footer}>
              <View style={styles.signBlock}>
                <View style={styles.signLine} />
                <Text style={styles.signRole}>{certificateConfig.coSignatory?.name || 'Academic Director'}</Text>
                <Text style={styles.meta}>{certificateConfig.coSignatory?.title || 'Director of Academic Affairs'}</Text>
              </View>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: certificateConfig.theme?.borderColorSecondary || '#b45309' }}>{certificateConfig.badgeText}</Text>
                <Text style={styles.meta}>ID: {certId}</Text>
                <Text style={styles.meta}>Issued: {issueDate}</Text>
              </View>

              <View style={styles.signBlock}>
                <View style={styles.signLine} />
                <Text style={styles.signRole}>{certificateConfig.signatory?.name || 'Head of Institution'}</Text>
                <Text style={styles.meta}>{certificateConfig.signatory?.title || 'Academic Director'}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

