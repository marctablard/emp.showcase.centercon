'use client';

import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SearchLayoutToggleProps {
  active: 'list' | 'grid';
  onSelectLayout: (selectedLayout: 'list' | 'grid') => void;
}

export function SearchLayoutToggle({ active, onSelectLayout }: SearchLayoutToggleProps) {
  return (
    <>
      <div className="hidden gap-2 sm:flex">
        <Button variant="iconSelector" data-active={active === 'list'} onClick={() => onSelectLayout('list')}>
          <LayoutList height={24} width={24} />
        </Button>
        <Button variant="iconSelector" data-active={active === 'grid'} onClick={() => onSelectLayout('grid')}>
          <LayoutGrid height={24} width={24} />
        </Button>
      </div>

      <div className="flex sm:hidden">
        <Select
          defaultValue={active}
          value={active}
          onValueChange={(value) => onSelectLayout(value as 'list' | 'grid')}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {active === 'list' && (
              <SelectItem value="grid">
                <LayoutGrid />
              </SelectItem>
            )}
            {active === 'grid' && (
              <SelectItem value="list">
                <LayoutList />
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
