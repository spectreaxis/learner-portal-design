# Certificates: design and security

How certificates are issued, verified and corrected, and what each security measure does and
doesn't protect against.

## Lifecycle

1. **Earned.** Passing a module's certification assessment creates a `Certificate` row with a
   random ID (`IIAIC-M<module>-<10 Crockford base32 characters>`, 50 bits). IDs created before
   October 31, 2026 end in a base36 timestamp and stay valid.
2. **Specimen.** Until it is paid for, the learner sees a specimen: their current profile name,
   no ID, no security code, no QR code, "SPECIMEN" across the page. The name follows the profile
   until payment, and the page tells the learner to fix it in Settings before paying.
3. **Issued.** The first time a paid certificate is viewed (by its owner or on `/verify`), the
   API fixes `recipientName` from the profile and signs the record. From then on, renaming the
   profile does not change the certificate.
4. **Corrected.** The owner can correct the name (see below). Each correction raises `revision`,
   re-signs, and adds a row to `CertificateNameChange`.

## Signature and security code

`backend/src/core/utils/certificate-signing.ts` signs, with Ed25519, a fixed-order JSON array of:
certificate ID, module number, recipient name, earned date and revision. The private key is
`CERTIFICATE_SIGNING_KEY` (base64 PKCS#8 DER). The API refuses to start without it, in every
environment, so no server ever signs with a shared or built-in key.

- **Tamper detection.** `/verify` re-checks the signature on every request. A row edited without
  the key (for example through direct database access) shows "Certificate Could Not Be Verified"
  and logs an error.
- **Security code.** The first 60 bits of the signature, printed on the certificate and shown on
  `/verify` as `XXXX-XXXX-XXXX`. It changes with every revision, so a copy printed before a name
  correction no longer matches the record.
- **The signed format is fixed.** Changing the payload, or the key, makes every issued certificate
  fail verification. A test pins the payload format. Keep the key in the password manager.

## Name corrections

The owner can correct the name on an issued certificate from its page, with a reason, after
confirming it matches their ID. The server (`core/utils/person-name.ts`) accepts only changes
towards the same person:

- typo, accent and capitalisation fixes, at most one edit per four letters and two in total
  (short names get none, so "Al" cannot become "Ed")
- adding, dropping or reordering name parts, as long as every part of one name is in the other,
  each part allowing the same typo budget ("Gavn" to "Gavin Taji" is fine, "Gavin Taji" to
  "Gavin Smith" is not)

Each certificate allows **two** corrections. Names must be letters (any script) separated by
spaces, hyphens, apostrophes or dots, 2 to 70 characters. Corrections are guarded by the
revision, so two at once cannot both get past the limit. Every correction is stored with the old
and new name, reason, revision, time and IP address, and `/verify` shows when the name was
corrected (not the previous names).

Anything else, such as a legal name change, goes to support (`hello@cogniwiseai.com`), who should
check ID before changing the record. **There is no admin tool for this yet**; it means an update
through the database, which `/verify` will then show as failing its integrity check unless the
record is also re-signed. Build a support re-issue command before relying on this path.

## The PDF

`components/CertificatePDF.tsx` is the only certificate design. The page renders it to a PDF blob,
draws that blob with pdf.js as the preview (`components/certificate-preview.tsx`), and the
Download button saves the same blob, so preview and download are always the same document.

- **Print:** A4 landscape, all vector (artwork, seal and QR code are paths, not images), fonts
  embedded and subset (Cormorant Garamond, Geist and Geist Mono, SIL OFL, licences in
  `public/fonts/certificate/`). Inks are chosen to sit inside the CMYK gamut. The frame stays 22pt
  from the edge, inside most printers' unprintable margin.
- **Security printing:** guilloche border and rosette watermark (generated in
  `lib/certificate-art.ts`), microtext repeating the certificate ID on all four sides of the frame
  (2.4pt, which photocopies as a line), and a QR code linking to `/verify/<id>`.
- **Metadata:** title, author, subject and keywords carry the certificate ID and verify link.

These features make a convincing forgery harder and an altered copy easier to spot. They do not
prove authenticity on their own: a PDF can always be edited. **The verification page is the source
of truth**, and the certificate says so.

## Verification page

`/verify/<id>` is public and rate limited per IP. It shows only what a verifier needs: name,
module, issue date, ID, security code and correction dates, never email or payment details. It
is marked `noindex`, so names don't show up in search results. Unpaid certificates are reported
as not found.

## Known limits

- **No revocation.** A certificate can't be withdrawn (for example after a refund or proven
  cheating) except by deleting the row.
- **No key rotation.** All signatures depend on the one key. Rotation would need a key ID in the
  record and re-signing.
- **No offline verification.** The public key isn't published, so a third party can't check a
  signature without the API. The security code ties a printed copy to the online record instead.
- **The certificate doesn't claim accreditation.** It is signed by Cogniwise as the issuer, with no
  named signatory. If an authorised person should sign, add their name, title and a signature image
  that they provided; don't invent one.
