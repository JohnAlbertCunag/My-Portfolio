export interface Profile {
  name: string
  shortName: string
  title: string
  eyebrow: string
  intro: string
  about: string
  photo: string
  email: string
  phone: string
  location: string
  resume: string
  availability: string
  education: { school: string; degree: string; period: string }
}

export interface Skill { name: string; category: string; level: string; icon: string; description: string }
export interface Project {
  id: string; number: string; title: string; category: string; description: string
  image: string; technologies: string[]; problem: string; solution: string
  features: string[]; contribution: string; github: string; demo: string
}
export interface Certificate { id: string; title: string; issuer: string; date: string; image: string; credential: string }
export interface Social { name: string; label: string; url: string; icon: string }
export interface Theme { accent: string; accentSoft: string }
export interface PortfolioData { profile: Profile; skills: Skill[]; projects: Project[]; certificates: Certificate[]; socials: Social[]; theme: Theme }
