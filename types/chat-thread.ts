export interface ChatThread {
  id: string;
  title: string;
  preview: string;
  time: string;
  href: string;
  unread?: boolean;
  avatarFallback: string;
}
