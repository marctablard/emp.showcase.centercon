import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SearchLayoutToggleProps {
  active: 'list' | 'grid';
  onSelectLayout: (selectedLayout: 'list' | 'grid') => void;
}

export function SearchLayoutToggle({ active, onSelectLayout }: SearchLayoutToggleProps) {
  // Todo:
  //  - add active state to buttons
  //  - add dropdown for mobile layout

  return (
    <div className="flex gap-2">
      <Button variant="neutral" onClick={() => onSelectLayout('list')}>
        <LayoutList />
      </Button>
      <Button variant="neutral" onClick={() => onSelectLayout('grid')}>
        <LayoutGrid />
      </Button>
    </div>
  );
}
