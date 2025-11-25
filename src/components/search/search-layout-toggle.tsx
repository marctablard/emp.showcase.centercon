'use client';

import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBreakpoint } from '@/hooks/useBreakpoint';

export interface SearchLayoutToggleProps {
  active: 'list' | 'grid';
  onSelectLayout: (selectedLayout: 'list' | 'grid') => void;
}

export function SearchLayoutToggle({ active, onSelectLayout }: SearchLayoutToggleProps) {
  const isAboveSmallScreen = useBreakpoint('sm');
  // Todo:
  //  - add active state to buttons

  return (
    <>
      {isAboveSmallScreen ? (
        <div className="flex gap-2">
          <Button variant="neutral" onClick={() => onSelectLayout('list')}>
            <LayoutList />
          </Button>
          <Button variant="neutral" onClick={() => onSelectLayout('grid')}>
            <LayoutGrid />
          </Button>
        </div>
      ) : (
        <div className="flex">
          <Select
            defaultValue={active}
            value={active}
            onValueChange={(value) => onSelectLayout(value as 'list' | 'grid')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">
                <LayoutList />
              </SelectItem>
              <SelectItem value="grid">
                <LayoutGrid />
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}
