import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle } from '@react-pdf/renderer';
import { BRAND_ARCS, BRAND_DOT } from './brand-mark';

// Professional certificate styles inspired by classical diploma design.
// Landscape A4 leaves roughly 440pt of height inside the borders; sizes below are
// budgeted to fit it, because react-pdf squeezes (and overlaps) text that overflows.
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    fontFamily: 'Times-Roman',
  },
  mainBorder: {
    border: '10px solid #1e3a8a', // Deep blue
    padding: 6,
    height: '100%',
  },
  innerBorder: {
    border: '2px solid #93c5fd', // Light blue
    padding: 6,
    height: '100%',
  },
  decorativeBorder: {
    border: '1px solid #cbd5e1',
    paddingTop: 22,
    paddingBottom: 30,
    paddingHorizontal: 40,
    height: '100%',
    backgroundColor: '#fefefe',
    position: 'relative',
    justifyContent: 'space-between',
  },
  // Corner decorations
  cornerTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 64,
    height: 64,
    borderTop: '4px solid #fbbf24',
    borderLeft: '4px solid #fbbf24',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 64,
    height: 64,
    borderTop: '4px solid #fbbf24',
    borderRight: '4px solid #fbbf24',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 64,
    height: 64,
    borderBottom: '4px solid #fbbf24',
    borderLeft: '4px solid #fbbf24',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 64,
    height: 64,
    borderBottom: '4px solid #fbbf24',
    borderRight: '4px solid #fbbf24',
  },
  // Seal, set between the two signatures
  seal: {
    width: 78,
    height: 78,
    borderRadius: 39,
    border: '5px solid #dc2626',
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    border: '1.5px solid #991b1b',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fecaca',
  },
  sealText: {
    fontSize: 6,
    color: '#7f1d1d',
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  // Header
  header: {
    alignItems: 'center',
  },
  logoMark: {
    width: 30,
    height: 30,
    marginBottom: 4,
  },
  logoText: {
    fontSize: 10,
    color: '#1e3a8a',
    fontFamily: 'Times-Bold',
    letterSpacing: 3,
    marginBottom: 3,
  },
  instituteName: {
    fontSize: 28,
    fontFamily: 'Times-Bold',
    color: '#1e293b',
    letterSpacing: 1,
    marginBottom: 4,
  },
  certificateLabel: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'Times-Italic',
    letterSpacing: 5,
    textTransform: 'uppercase',
  },
  // Main content
  content: {
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  presentedTo: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Times-Italic',
    marginBottom: 6,
  },
  recipientName: {
    fontSize: 34,
    fontFamily: 'Times-Bold',
    color: '#1e293b',
    textAlign: 'center',
    paddingBottom: 6,
    paddingHorizontal: 40,
    borderBottom: '1.5px solid #cbd5e1',
    marginBottom: 12,
  },
  moduleLabel: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Times-Italic',
    marginBottom: 4,
  },
  moduleTitle: {
    fontSize: 18,
    fontFamily: 'Times-Bold',
    color: '#1e3a8a',
    textAlign: 'center',
    lineHeight: 1.25,
    marginBottom: 10,
  },
  description: {
    fontSize: 10.5,
    color: '#475569',
    lineHeight: 1.5,
    textAlign: 'center',
    fontFamily: 'Times-Roman',
    maxWidth: 560,
  },
  // Details + signatures
  bottom: {
    paddingHorizontal: 30,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTop: '1.5px solid #e2e8f0',
    marginBottom: 6,
  },
  detailBox: {
    width: '30%',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 8,
    color: '#94a3b8',
    fontFamily: 'Times-Italic',
    marginBottom: 2,
    letterSpacing: 1,
  },
  detailValue: {
    fontSize: 11,
    color: '#1e293b',
    fontFamily: 'Times-Bold',
  },
  signatureRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBox: {
    width: '34%',
    alignItems: 'center',
  },
  signatureLine: {
    borderTop: '1.5px solid #1e293b',
    width: '100%',
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 11,
    color: '#1e293b',
    fontFamily: 'Times-Bold',
    marginBottom: 1,
  },
  signatureTitle: {
    fontSize: 9,
    color: '#64748b',
    fontFamily: 'Times-Roman',
  },
  signatureLabel: {
    fontSize: 8.5,
    color: '#64748b',
    fontFamily: 'Times-Italic',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 12,
    left: 90,
    right: 90,
    textAlign: 'center',
    fontSize: 7.5,
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
  verifyUrl: string;
}

export const CertificatePDF: React.FC<CertificatePDFProps> = ({
  recipientName,
  moduleNumber,
  moduleTitle,
  certificateId,
  issueDate,
  verifyUrl,
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

            {/* Header */}
            <View style={styles.header}>
              <Svg viewBox="0 0 40 40" style={styles.logoMark}>
                {BRAND_ARCS.map((d) => (
                  <Path key={d} d={d} fill="none" stroke="#1e3a8a" strokeWidth={2.4} strokeLinecap="round" />
                ))}
                <Circle cx={BRAND_DOT.cx} cy={BRAND_DOT.cy} r={BRAND_DOT.r} fill="#007eb7" />
              </Svg>
              <Text style={styles.logoText}>COGNIWISE</Text>
              <Text style={styles.instituteName}>Artificial Intelligence Literacy</Text>
              <Text style={styles.certificateLabel}>~ Certificate of Completion ~</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
              <Text style={[styles.recipientName, recipientName.length > 24 ? { fontSize: 26 } : {}]}>{recipientName}</Text>
              <Text style={styles.moduleLabel}>for successful completion of</Text>
              <Text style={[styles.moduleTitle, moduleTitle.length > 60 ? { fontSize: 15 } : {}]}>
                Module {moduleNumber}: {moduleTitle}
              </Text>
              <Text style={styles.description}>
                in recognition of demonstrating comprehensive understanding and mastery
                of the subject matter through completion of all course lessons and
                achieving a passing score on the certification assessment as part of
                the Cogniwise Artificial Intelligence Literacy Basic AI/ML Program.
              </Text>
            </View>

            {/* Details, signatures and seal */}
            <View style={styles.bottom}>
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

              <View style={styles.signatureRow}>
                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Dr. Sarah Mitchell</Text>
                  <Text style={styles.signatureTitle}>Director of Education</Text>
                  <Text style={styles.signatureLabel}>Cogniwise Artificial Intelligence Literacy</Text>
                </View>

                <View style={styles.seal}>
                  <View style={styles.sealInner}>
                    <Text style={styles.sealText}>
                      COGNIWISE{'\n'}ARTIFICIAL{'\n'}INTELLIGENCE{'\n'}LITERACY
                    </Text>
                  </View>
                </View>

                <View style={styles.signatureBox}>
                  <View style={styles.signatureLine} />
                  <Text style={styles.signatureName}>Prof. James Chen</Text>
                  <Text style={styles.signatureTitle}>Chief Academic Officer</Text>
                  <Text style={styles.signatureLabel}>Cogniwise Artificial Intelligence Literacy</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text>
                This certificate is issued under the Cogniwise Artificial Intelligence Literacy Framework • Verify authenticity at {verifyUrl}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
