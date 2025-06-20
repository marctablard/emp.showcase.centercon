'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TopBarSwitcher({
  options,
  current,
  label,
  onSelected,
  icon,
}: React.ComponentProps<'button'> & {
  options: {
    code: string;
    name: string;
  }[];
  current: string;
  label: string;
  onSelected?: (code: string) => void;
  icon?: React.ReactNode;
}) {
  if (!options || options.length <= 1 || !current) {
    return null;
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger
          aria-label={label}
          className="flex items-center gap-2 h-auto p-0 normal-case p-1 focus-none hover:cursor-pointer"
        >
          <>
            {icon}
            <span className="text-sm pt-0.5">{options.find((option) => option.code == current)?.name}</span>
          </>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.code}
              onClick={() => onSelected?.(option.code)}
              className={'hover:cursor-pointer ' + (option.code === current ? 'bg-muted' : '')}
            >
              {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
