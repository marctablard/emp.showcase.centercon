import { LucideIcon } from 'lucide-react';

interface HeaderIconButtonProps {
  icon: LucideIcon;
  text: string;
  onClick?: () => void;
}

export function HeaderIconButton({ icon: Icon, text, onClick }: HeaderIconButtonProps) {
  return (
    <button
      aria-label={text}
      onClick={onClick}
      className="flex flex-col text-primary-600 items-center min-w-12 rounded-sm p-0.5 hover:bg-primary hover:text-white transition-colors focus-visible:outline-2 focus:outline-primary cursor-pointer"
    >
      <Icon className="w-8 h-8" />
      <p className="text-sm font-bold -mt-1">{text}</p>
    </button>
  );
}
