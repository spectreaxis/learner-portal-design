import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Path, Circle, G, Defs, ClipPath, Rect, Font } from '@react-pdf/renderer';
import { BRAND_ARCS, BRAND_DOT } from './brand-mark';
import { braidPaths, qrCodePath, rosettePath, starburstPath } from '@/lib/certificate-art';

// The certificate is a single vector PDF; the on-screen preview is this same
// file rendered (see certificate-preview.tsx), so the two cannot drift apart.
// Fonts are embedded (SIL OFL, licences beside them in public/fonts/certificate).
Font.register({
  family: 'Cormorant',
  fonts: [
    { src: '/fonts/certificate/CormorantGaramond-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/certificate/CormorantGaramond-MediumItalic.ttf', fontWeight: 500, fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Geist',
  fonts: [
    { src: '/fonts/certificate/Geist-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/certificate/Geist-SemiBold.ttf', fontWeight: 600 },
  ],
});
Font.register({ family: 'Geist Mono', src: '/fonts/certificate/GeistMono-Medium.ttf', fontWeight: 500 });
// Names and titles must never be split with a hyphen
Font.registerHyphenationCallback((word) => [word]);

// Inks chosen to sit inside the CMYK gamut, so print matches screen closely
const INK = '#1B2A41'; // navy, body text and seal
const TEAL = '#0B6E99'; // brand
const GOLD = '#A8843A'; // muted ochre, prints as a metallic-looking gold
const SLATE = '#4A5568';
const MUTED = '#7A8699';

// A4 landscape in points
const W = 841.89;
const H = 595.28;
// The guilloche frame: a band between these insets from the page edge
const BAND_OUTER = 22;
const BAND_INNER = 50;
const BAND_MID = (BAND_OUTER + BAND_INNER) / 2;
const MEDALLION = 15;
const MICROTEXT = { fontSize: 2.4, fontFamily: 'Geist', fontWeight: 600 } as const;

const styles = StyleSheet.create({
  page: { backgroundColor: '#FFFFFF', fontFamily: 'Geist', color: INK },
  // Pinned by its edges: an explicit full-page height makes react-pdf start a new page
  art: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  body: {
    position: 'absolute',
    top: BAND_INNER + 28,
    left: BAND_INNER + 40,
    right: BAND_INNER + 40,
    bottom: BAND_INNER + 24,
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  brandMark: { width: 22, height: 22, marginRight: 7 },
  brandName: { fontSize: 9, fontWeight: 600, letterSpacing: 3.2, color: TEAL },
  programme: { fontFamily: 'Cormorant', fontWeight: 600, fontSize: 30, letterSpacing: 0.4 },
  kind: { fontSize: 8, fontWeight: 600, letterSpacing: 4.2, color: GOLD, marginTop: 4 },
  certify: { fontFamily: 'Cormorant', fontStyle: 'italic', fontWeight: 500, fontSize: 14, color: SLATE, marginTop: 30 },
  name: { fontFamily: 'Cormorant', fontWeight: 600, textAlign: 'center', marginTop: 4 },
  nameRule: { width: 380, borderBottomWidth: 0.75, borderBottomColor: GOLD, marginTop: 2 },
  completed: { fontFamily: 'Cormorant', fontStyle: 'italic', fontWeight: 500, fontSize: 13, color: SLATE, marginTop: 16 },
  module: { fontFamily: 'Cormorant', fontWeight: 600, fontSize: 19, textAlign: 'center', color: TEAL, marginTop: 4 },
  statement: { fontSize: 8.5, lineHeight: 1.5, color: SLATE, textAlign: 'center', maxWidth: 470, marginTop: 8 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'flex-end' },
  column: { width: '36%' },
  sealColumn: { width: '28%', alignItems: 'center' },
  label: { fontSize: 5.8, fontWeight: 600, letterSpacing: 1.6, color: MUTED, marginBottom: 1.5 },
  value: { fontSize: 9, fontWeight: 600, marginBottom: 7 },
  code: { fontFamily: 'Geist Mono', fontWeight: 500, fontSize: 8.5, marginBottom: 7, letterSpacing: 0.3 },
  issuer: { fontSize: 8, color: SLATE },
  verifyBlock: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'flex-end' },
  verifyText: { alignItems: 'flex-end', marginRight: 8, marginBottom: 4 },
  verifyLine: { fontSize: 6.5, color: SLATE, textAlign: 'right' },
  qr: { width: 66, height: 66 },
  qrPending: {
    width: 66,
    height: 66,
    borderWidth: 0.75,
    borderColor: MUTED,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPendingText: { fontSize: 5.5, color: MUTED, textAlign: 'center', lineHeight: 1.4 },
  verifyFooter: {
    position: 'absolute',
    left: BAND_INNER,
    right: BAND_INNER,
    bottom: BAND_INNER + 9,
    fontSize: 5.6,
    color: MUTED,
    textAlign: 'center',
  },
  specimen: {
    position: 'absolute',
    top: H / 2 - 60,
    left: 0,
    width: W,
    textAlign: 'center',
    fontFamily: 'Geist',
    fontWeight: 600,
    fontSize: 120,
    letterSpacing: 24,
    color: '#B42318',
    opacity: 0.13,
    transform: 'rotate(-22deg)',
  },
});

// Long names step down so they stay on one line where possible
function nameSize(name: string): number {
  if (name.length <= 22) return 44;
  if (name.length <= 32) return 36;
  if (name.length <= 44) return 29;
  return 23;
}

function BrandMarkSvg({ style, color }: { style: any; color: string }) {
  return (
    <Svg viewBox="0 0 40 40" style={style}>
      {BRAND_ARCS.map((d) => (
        <Path key={d} d={d} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      ))}
      <Circle cx={BRAND_DOT.cx} cy={BRAND_DOT.cy} r={BRAND_DOT.r} fill={TEAL} />
    </Svg>
  );
}

// Frame, central rosette and watermark; nothing here varies per certificate
// except the microtext, which repeats the certificate ID
function Artwork({ microtext }: { microtext: string }) {
  const braid = { amplitude: 8, wavelength: 21, strands: 6 };
  const span = (size: number) => size - 2 * (BAND_MID + MEDALLION);
  const corners: [number, number][] = [
    [BAND_MID, BAND_MID],
    [W - BAND_MID, BAND_MID],
    [BAND_MID, H - BAND_MID],
    [W - BAND_MID, H - BAND_MID],
  ];
  const strands = [
    ...braidPaths(BAND_MID + MEDALLION, BAND_MID, span(W), true, braid),
    ...braidPaths(BAND_MID + MEDALLION, H - BAND_MID, span(W), true, braid),
    ...braidPaths(BAND_MID, BAND_MID + MEDALLION, span(H), false, braid),
    ...braidPaths(W - BAND_MID, BAND_MID + MEDALLION, span(H), false, braid),
  ];
  // Repeated well past the frame's length; each side's clip trims it
  const line = `${microtext} • `.repeat(14);
  const across = W - 2 * BAND_INNER;
  const down = H - 2 * BAND_INNER;
  const microtextSides = [
    { clip: { x: BAND_INNER, y: BAND_INNER - 5, width: across, height: 5 }, transform: `translate(${BAND_INNER}, ${BAND_INNER - 1.6})` },
    { clip: { x: BAND_INNER, y: H - BAND_INNER, width: across, height: 5 }, transform: `translate(${BAND_INNER}, ${H - BAND_INNER + 3.4})` },
    { clip: { x: W - BAND_INNER, y: BAND_INNER, width: 5, height: down }, transform: `translate(${W - BAND_INNER + 1.6}, ${BAND_INNER}) rotate(90)` },
    { clip: { x: BAND_INNER - 5, y: BAND_INNER, width: 5, height: down }, transform: `translate(${BAND_INNER - 1.6}, ${H - BAND_INNER}) rotate(-90)` },
  ];

  return (
    <Svg style={styles.art} viewBox={`0 0 ${W} ${H}`}>
      {/* Watermark: a fine rosette and the brand mark, faint behind the text */}
      <G opacity={0.07}>
        {[0.9, 0.75, 0.6].map((pen, i) => (
          <Path
            key={pen}
            d={rosettePath(W / 2, H / 2 + 6, 210 - i * 22, { fixed: 96, rolling: 41, pen: pen * 41 })}
            fill="none"
            stroke={TEAL}
            strokeWidth={0.35}
          />
        ))}
      </G>
      <G opacity={0.045} transform={`translate(${W / 2 - 120}, ${H / 2 - 114}) scale(6)`}>
        {BRAND_ARCS.map((d) => (
          <Path key={d} d={d} fill="none" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
        ))}
      </G>

      {/* Guilloche frame */}
      <Path
        d={`M${BAND_OUTER} ${BAND_OUTER}H${W - BAND_OUTER}V${H - BAND_OUTER}H${BAND_OUTER}Z`}
        fill="none"
        stroke={INK}
        strokeWidth={1.4}
      />
      <Path
        d={`M${BAND_INNER} ${BAND_INNER}H${W - BAND_INNER}V${H - BAND_INNER}H${BAND_INNER}Z`}
        fill="none"
        stroke={GOLD}
        strokeWidth={0.8}
      />
      <Path
        d={`M${BAND_INNER + 4} ${BAND_INNER + 4}H${W - BAND_INNER - 4}V${H - BAND_INNER - 4}H${BAND_INNER + 4}Z`}
        fill="none"
        stroke={GOLD}
        strokeWidth={0.3}
      />
      {strands.map((d, i) => (
        <Path key={i} d={d} fill="none" stroke={TEAL} strokeWidth={0.35} opacity={0.6} />
      ))}
      {corners.map(([x, y]) => (
        <G key={`${x}-${y}`}>
          <Circle cx={x} cy={y} r={MEDALLION} fill="#FFFFFF" stroke={GOLD} strokeWidth={0.6} />
          <Path
            d={rosettePath(x, y, MEDALLION - 3, { fixed: 18, rolling: 5, pen: 3 })}
            fill="none"
            stroke={INK}
            strokeWidth={0.3}
          />
        </G>
      ))}

      {/* Microtext just outside the gold rule, on all four sides: it reads as a
          plain line unless magnified, and photocopies as a smudge */}
      <Defs>
        {microtextSides.map(({ clip }, i) => (
          <ClipPath key={i} id={`microtext-${i}`}>
            <Rect {...clip} />
          </ClipPath>
        ))}
      </Defs>
      {microtextSides.map(({ transform }, i) => (
        <G key={transform} clipPath={`url(#microtext-${i})`}>
          <Text x={0} y={0} transform={transform} style={MICROTEXT} fill={INK}>
            {line}
          </Text>
        </G>
      ))}
    </Svg>
  );
}

// Approximate advance widths for Geist SemiBold capitals, so letters set around
// the seal's ring are evenly spaced (narrow I and space, wide M and W)
const SEAL_ADVANCE: Record<string, number> = { I: 0.32, ' ': 0.36, '•': 0.5, M: 0.9, W: 0.98 };
const advance = (char: string) => SEAL_ADVANCE[char] ?? 0.68;

function Seal() {
  const ring = 'COGNIWISE • ARTIFICIAL INTELLIGENCE LITERACY • CERTIFIED • ';
  const total = ring.split('').reduce((sum, char) => sum + advance(char), 0);
  let travelled = 0;
  // Each letter sits at the middle of its share of the circle
  const angles = ring.split('').map((char) => {
    const angle = ((travelled + advance(char) / 2) / total) * 360;
    travelled += advance(char);
    return angle;
  });
  return (
    <Svg viewBox="0 0 100 100" style={{ width: 92, height: 92 }}>
      <Path d={starburstPath(50, 50, 49.5, 46, 60)} fill={GOLD} />
      <Circle cx={50} cy={50} r={44} fill="#FFFFFF" />
      <Circle cx={50} cy={50} r={42.5} fill="none" stroke={INK} strokeWidth={1.1} />
      <Circle cx={50} cy={50} r={30} fill="none" stroke={INK} strokeWidth={0.6} />
      <Path d={rosettePath(50, 50, 28, { fixed: 40, rolling: 13, pen: 9 })} fill="none" stroke={GOLD} strokeWidth={0.25} />
      {ring.split('').map((char, i) => (
        <Text
          key={i}
          x={50}
          y={14.2}
          textAnchor="middle"
          transform={`rotate(${angles[i]}, 50, 50)`}
          style={{ fontSize: 6.4, fontFamily: 'Geist', fontWeight: 600 }}
          fill={INK}
        >
          {char}
        </Text>
      ))}
      <G transform="translate(36, 33) scale(0.7)">
        {BRAND_ARCS.map((d) => (
          <Path key={d} d={d} fill="none" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        ))}
        <Circle cx={BRAND_DOT.cx} cy={BRAND_DOT.cy} r={BRAND_DOT.r} fill={TEAL} />
      </G>
      <Text x={50} y={69} textAnchor="middle" style={{ fontSize: 5, fontFamily: 'Geist', fontWeight: 600 }} fill={INK}>
        VERIFIED
      </Text>
    </Svg>
  );
}

function QrCode({ url }: { url: string }) {
  const { path, size } = qrCodePath(url);
  return (
    <Svg viewBox={`0 0 ${size} ${size}`} style={styles.qr}>
      <Path d={path} fill={INK} />
    </Svg>
  );
}

interface IssuedDetails {
  certificateId: string;
  securityCode: string;
  verifyUrl: string;
}

export interface CertificatePDFProps {
  recipientName: string;
  moduleNumber: number;
  moduleTitle: string;
  issueDate: string;
  /** Null renders a specimen: no ID, code or QR, marked across the page */
  issued: IssuedDetails | null;
}

export const CertificatePDF: React.FC<CertificatePDFProps> = ({
  recipientName,
  moduleNumber,
  moduleTitle,
  issueDate,
  issued,
}) => {
  const programme = 'Cogniwise Artificial Intelligence Literacy';
  return (
    <Document
      title={`${programme} Certificate, Module ${moduleNumber}${issued ? ` (${issued.certificateId})` : ''}`}
      author={programme}
      subject={`Certificate of completion awarded to ${recipientName}`}
      keywords={issued ? `certificate, ${issued.certificateId}, ${issued.verifyUrl}` : 'certificate, specimen'}
      creator={programme}
      producer={programme}
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Artwork microtext={`${programme.toUpperCase()} • ${issued ? issued.certificateId : 'SPECIMEN'}`} />

        <View style={styles.body}>
          <View style={styles.brandRow}>
            <BrandMarkSvg style={styles.brandMark} color={INK} />
            <Text style={styles.brandName}>COGNIWISE</Text>
          </View>
          <Text style={styles.programme}>Artificial Intelligence Literacy</Text>
          <Text style={styles.kind}>CERTIFICATE OF COMPLETION</Text>

          <Text style={styles.certify}>This is to certify that</Text>
          <Text style={[styles.name, { fontSize: nameSize(recipientName) }]}>{recipientName}</Text>
          <View style={styles.nameRule} />

          <Text style={styles.completed}>has successfully completed</Text>
          <Text style={styles.module}>
            Module {moduleNumber}: {moduleTitle}
          </Text>
          <Text style={styles.statement}>
            including every lesson and the certification assessment of the Cogniwise Artificial
            Intelligence Literacy Basic AI/ML Course, demonstrating a sound understanding of the
            subject and its practical use.
          </Text>

          <View style={styles.footer}>
            <View style={styles.column}>
              <Text style={styles.label}>DATE OF ISSUE</Text>
              <Text style={styles.value}>{issueDate}</Text>
              <Text style={styles.label}>CERTIFICATE ID</Text>
              <Text style={styles.code}>{issued ? issued.certificateId : 'Assigned on issue'}</Text>
              <Text style={styles.label}>ISSUED AND DIGITALLY SIGNED BY</Text>
              <Text style={styles.issuer}>{programme}</Text>
            </View>

            <View style={styles.sealColumn}>
              <Seal />
            </View>

            <View style={[styles.column, styles.verifyBlock]}>
              <View style={styles.verifyText}>
                <Text style={styles.label}>SECURITY CODE</Text>
                <Text style={styles.code}>{issued ? issued.securityCode : '—'}</Text>
                <Text style={styles.verifyLine}>Scan to confirm this</Text>
                <Text style={styles.verifyLine}>certificate is genuine</Text>
              </View>
              {issued ? (
                <QrCode url={issued.verifyUrl} />
              ) : (
                <View style={styles.qrPending}>
                  <Text style={styles.qrPendingText}>{'Verification\ncode added\non issue'}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.verifyFooter}>
          {issued
            ? `Verify at ${issued.verifyUrl}  •  The name, ID and security code must match the record shown there  •  Any alteration voids this certificate`
            : 'Specimen. Not a valid certificate.'}
        </Text>

        {!issued && <Text style={styles.specimen}>SPECIMEN</Text>}
      </Page>
    </Document>
  );
};
