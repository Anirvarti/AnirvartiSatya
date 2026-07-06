export type TabId = 'home' | 'about' | 'terminal' | 'projects' | 'contact' | 'synth' | 'gallery' | 'certs' | 'future' | 'activities' | 'gossip';

export interface Tab {
  id: TabId;
  label: string;
  isLocked: boolean;
}

export interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  tags: string[];
  role: string;
  year: string;
  links: {
    live?: string;
    github?: string;
  };
  metrics?: { label: string; value: string }[];
}

export interface SkillCategory {
  category: string;
  items: string[];
}
