export interface NavLink {
  label: string;
  href: string;
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface ExperienceEntry {
  role: string;
  company: string;
  companyUrl: string;
  period: string;
  badge: string;
  summary: string;
  highlights: readonly string[];
  tags: readonly string[];
}

export interface SocialLink {
  label: string;
  href: string;
}
