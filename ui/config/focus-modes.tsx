import { FocusMode } from '@/types/focus-modes';
import { SiReddit, SiYoutube } from '@icons-pack/react-simple-icons';
import { BadgePercent, Globe, Pencil, SwatchBook } from 'lucide-react';

export const FocusModeList: FocusMode[] = [
  {
    id: 'webSearch',
    name: 'All',
    description: 'Searches across all of the internet',
    icon: <Globe size={20} />,
    endpoint: 'https://www.google.com/search?q=',
  },
  {
    id: 'academicSearch',
    name: 'Academic',
    description: 'Search in published academic papers',
    icon: <SwatchBook size={20} />,
    endpoint: 'https://www.google.com/search?q=',
  },
  {
    id: 'writingAssistant',
    name: 'Writing',
    description: 'Chat without searching the web',
    icon: <Pencil size={16} />,
    endpoint: 'https://www.google.com/search?q=',
  },
  {
    id: 'wolframAlphaSearch',
    name: 'Wolfram Alpha',
    description: 'Computational knowledge engine',
    icon: <BadgePercent size={20} />,
    endpoint: 'https://www.google.com/search?q=',
  },
  {
    id: 'youtubeSearch',
    name: 'Youtube',
    description: 'Search and watch videos',
    icon: <SiYoutube className="h-5 w-auto mr-0.5" />,
    endpoint: 'https://www.google.com/search?q=',
  },
  {
    id: 'redditSearch',
    name: 'Reddit',
    description: 'Search for discussions and opinions',
    icon: <SiReddit className="h-5 w-auto mr-0.5" />,
    endpoint: 'https://www.google.com/search?q=',
  },
  {
    id: 'SICHANG',
    name: 'Sichang',
    description: 'This is a Test Focus Mode',
    icon: <SiReddit className="h-5 w-auto mr-0.5" />,
    endpoint: 'https://www.google.com/search?q=',
  },
];
