// Single source of truth for brand facts used across the page, metadata and JSON-LD.
// Confirm the contact address and portal URL before deploying.
export const site = {
  name: 'Cogniwise',
  legalName: 'Cogniwise AI',
  url: 'https://cogniwiseai.com',
  email: 'hello@cogniwiseai.com',
  portalUrl: 'https://learn.cogniwiseai.com',
  title: 'Cogniwise: AI literacy, upskilling and adoption consulting',
  description:
    'Cogniwise provides AI competency training, advisory and consulting for organisations and individuals: AI literacy programmes, workforce upskilling, structured AI adoption courses and strategic consulting.',
} as const

export const nav = [
  { href: '#programmes', label: 'Programmes' },
  { href: '#method', label: 'Method' },
  { href: '#who', label: 'Who it’s for' },
  { href: '#questions', label: 'Questions' },
] as const

// Learner portal routes (see app/login and app/register in the portal).
export const signInHref = `${site.portalUrl}/login`
export const signUpHref = `${site.portalUrl}/register`

export const briefingHref = `mailto:${site.email}?subject=${encodeURIComponent('Cogniwise briefing request')}`
