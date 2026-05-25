import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Professional certificate styles inspired by classical diploma design
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Times-Roman',
  },
  mainBorder: {
    border: '12px solid #1e3a8a', // Deep blue
    padding: 8,
    height: '100%',
  },
  innerBorder: {
    border: '2px solid #93c5fd', // Light blue
    padding: 8,
    height: '100%',
  },
  decorativeBorder: {
    border: '1px solid #cbd5e1',
    padding: 30,
    height: '100%',
    backgroundColor: '#fefefe',
    position: 'relative',
  },
  // Corner decorations
  cornerTopLeft: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 80,
    height: 80,
    borderTop: '4px solid #fbbf24',
    borderLeft: '4px solid #fbbf24',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 80,
    height: 80,
    borderTop: '4px solid #fbbf24',
    borderRight: '4px solid #fbbf24',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    width: 80,
    height: 80,
    borderBottom: '4px solid #fbbf24',
    borderLeft: '4px solid #fbbf24',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 80,
    height: 80,
    borderBottom: '4px solid #fbbf24',
    borderRight: '4px solid #fbbf24',
  },
  // Seal
  seal: {
    position: 'absolute',
    bottom: 60,
    right: 60,
    width: 100,
    height: 100,
    borderRadius: 50,
    border: '6px solid #dc2626',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    border: '2px solid #991b1b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fecaca',
  },
  sealText: {
    fontSize: 9,
    color: '#7f1d1d',
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  // Header
  header: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoText: {
    fontSize: 11,
    color: '#1e3a8a',
    fontFamily: 'Times-Bold',
    letterSpacing: 3,
    marginBottom: 5,
  },
  instituteName: {
    fontSize: 36,
    fontFamily: 'Times-Bold',
    color: '#1e293b',
    marginBottom: 15,
    letterSpacing: 1,
  },
  certificateLabel: {
    fontSize: 16,
    color: '#475569',
    fontFamily: 'Times-Italic',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 25,
  },
  // Main content
  content: {
    textAlign: 'center',
    paddingHorizontal: 60,
  },
  presentedTo: {
    fontSize: 14,
    color: '#64748b',
    fontFamily: 'Times-Italic',
    marginBottom: 15,
  },
  recipientName: {
    fontSize: 42,
    fontFamily: 'Times-Bold',
    color: '#1e293b',
    marginBottom: 25,
    borderBottom: '2px solid #cbd5e1',
    paddingBottom: 10,
  },
  moduleSection: {
    marginTop: 25,
    marginBottom: 25,
  },
  moduleLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Times-Italic',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 22,
    fontFamily: 'Times-Bold',
    color: '#1e3a8a',
    marginBottom: 20,
  },
  description: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 1.8,
    textAlign: 'center',
    fontFamily: 'Times-Roman',
    marginBottom: 30,
  },
  // Details section
  detailsSection: {
    marginTop: 40,
    paddingTop: 25,
    borderTop: '2px solid #e2e8f0',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  detailBox: {
    width: '30%',
    textAlign: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: 'Times-Italic',
    marginBottom: 6,
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 13,
    color: '#1e293b',
    fontFamily: 'Times-Bold',
  },
  // Signature section
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    paddingHorizontal: 60,
  },
  signatureBox: {
    width: '40%',
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '2px solid #1e293b',
    marginBottom: 8,
    marginTop: 30,
  },
  signatureLabel: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Times-Italic',
  },
  signatureName: {
    fontSize: 12,
    color: '#1e293b',
    fontFamily: 'Times-Bold',
    marginBottom: 3,
  },
  signatureTitle: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'Times-Roman',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 60,
    right: 60,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
    fontFamily: 'Times-Italic',
  },
});

interface CertificatePDFProps {
  recipientName: string;
  moduleNumber: number;
  moduleTitle: string;
  certificateId: string;
  issueDate: string;
}

export const CertificatePDF: React.FC<CertificatePDFProps> = ({
  recipientName,
  moduleNumber,
  moduleTitle,
  certificateId,
  issueDate,
}) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.mainBorder}>
        <View style={styles.innerBorder}>
          <View style={styles.decorativeBorder}>
            {/* Corner decorations */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />

            {/* Official Seal */}
            <View style={styles.seal}>
              <View style={styles.sealInner}>
                <Text style={styles.sealText}>
                  IIAIC{'\n'}VERIFIED{'\n'}CERTIFICATE
                </Text>
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.logoText}>INTERNATIONAL INSTITUTE OF</Text>
              <Text style={styles.instituteName}>AI Competence</Text>
              <Text style={styles.certificateLabel}>~ Certificate of Completion ~</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>

              <Text style={styles.recipientName}>{recipientName}</Text>

              <View style={styles.moduleSection}>
                <Text style={styles.moduleLabel}>for successful completion of</Text>
                <Text style={styles.moduleTitle}>
                  Module {moduleNumber}: {moduleTitle}
                </Text>
              </View>

              <Text style={styles.description}>
                in recognition of demonstrating comprehensive understanding and mastery
                of the subject matter through completion of all course lessons and
                achieving a passing score on the certification assessment as part of
                the IIAIC Basic AI/ML Literacy Program.
              </Text>

              {/* Details */}
              <View style={styles.detailsSection}>
                <View style={styles.detailsRow}>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>CERTIFICATE ID</Text>
                    <Text style={styles.detailValue}>{certificateId}</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>DATE ISSUED</Text>
                    <Text style={styles.detailValue}>{issueDate}</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailLabel}>MODULE</Text>
                    <Text style={styles.detailValue}>Module {moduleNumber}</Text>
                  </View>
                </View>
              </View>

              {/* Signatures */}
              <View style={styles.signatureSection}>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Dr. Sarah Mitchell</Text>
                  <Text style={styles.signatureTitle}>Director of Education</Text>
                  <Text style={styles.signatureLabel}>IIAIC</Text>
                </View>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Prof. James Chen</Text>
                  <Text style={styles.signatureTitle}>Chief Academic Officer</Text>
                  <Text style={styles.signatureLabel}>IIAIC</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text>
                This certificate is issued under the IIAIC AI Competence Framework • Verify authenticity at iiaic.org/verify
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
