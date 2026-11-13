import type { Project } from '../types'

// Put replacement thumbnails in public/images/projects/ and update the image path below.
export const projects: Project[] = [
  {
    id: 'camfit', number: '01', title: 'CamFit', category: 'Academic · AI & wellness',
    description: 'A concept fitness companion that turns personal goals into more approachable workout recommendations.',
    image: '/images/projects/camfit.svg', technologies: ['React', 'JavaScript', 'Firebase'],
    problem: 'Finding a workout plan that feels personal can be intimidating for people starting a new fitness routine.',
    solution: 'CamFit explores a friendly, guided way to match fitness goals with relevant exercise recommendations.',
    features: ['Goal-oriented onboarding', 'Personalized recommendations', 'Simple progress overview'],
    contribution: 'Project concept, interface design, and front-end implementation.', github: '', demo: '',
  },
  {
    id: 'hotel-reservations', number: '02', title: 'Staywise', category: 'Academic · Information systems',
    description: 'A hotel reservation management concept designed to make guest bookings and room status easier to follow.',
    image: '/images/projects/staywise.svg', technologies: ['HTML', 'CSS', 'JavaScript'],
    problem: 'Keeping track of reservations and room availability can become difficult when information is scattered.',
    solution: 'Staywise brings essential booking details into one clear, easy-to-scan management experience.',
    features: ['Reservation overview', 'Room availability status', 'Guest booking details'],
    contribution: 'Student project: planning, interface layout, and front-end development.', github: '', demo: '',
  },
  {
    id: 'portfolio', number: '03', title: 'A little bit of the web', category: 'Personal · Web experiments',
    description: 'Small, focused web experiments made to practice the craft of building things for the internet.',
    image: '/images/projects/studio.svg', technologies: ['HTML', 'CSS', 'JavaScript'],
    problem: 'Learning works best when concepts turn into something you can actually use and share.',
    solution: 'A growing collection of small projects focused on interface fundamentals and creative exploration.',
    features: ['Responsive page layouts', 'Thoughtful visual details', 'Progressive feature experiments'],
    contribution: 'Independent ideas, design exploration, and build.', github: '', demo: '',
  },
]
