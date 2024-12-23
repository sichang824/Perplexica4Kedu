export type FocusMode = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
};

export const DefaultFocusMode: FocusMode = {
  id: 'default',
  name: 'Default',
  description: 'Default focus mode',
  icon: null,
  endpoint: 'https://www.google.com/search?q=',
};
