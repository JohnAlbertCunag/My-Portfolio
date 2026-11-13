import type { Certificate } from '../types'

// Add certificate scans to public/images/certificates/ and edit each image path.
export const certificates: Certificate[] = [
  { id: 'learning-01', title: 'Learning in progress', issuer: 'Your course or organization', date: 'Add date', image: '/images/certificates/certificate.svg', credential: '' },
  { id: 'learning-02', title: 'Room for the next milestone', issuer: 'A new achievement goes here', date: 'Add date', image: '/images/certificates/certificate.svg', credential: '' },
]
