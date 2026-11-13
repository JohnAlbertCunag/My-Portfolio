import type { Certificate } from '../types'

// Add future certificate images under public/images/certificates/ and update the image path.
export const certificates: Certificate[] = [
  {
    id: 'sap-s4hana-training',
    title: 'S/4HANA Modules Using Global Bike',
    issuer: 'SAP University Alliances · STI College, Philippines',
    date: 'January–June 2025',
    image: '/images/certificates/sap-s4hana-training.png',
    credential: '',
  },
  {
    id: 'oracle-java-fundamentals',
    title: 'Java Fundamentals',
    issuer: 'Oracle Academy',
    date: '19 June 2024',
    image: '/images/certificates/oracle-java-fundamentals.png',
    credential: '',
  },
]
