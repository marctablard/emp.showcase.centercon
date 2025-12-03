'use client';

import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export interface SearchLayoutToggleProps {
  active: 'list' | 'grid';
  onSelectLayout: (selectedLayout: 'list' | 'grid') => void;
}

export function SearchLayoutToggle({ active, onSelectLayout }: SearchLayoutToggleProps) {
  return (
    <>
      <div className="hidden gap-1 sm:flex">
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
            {active === 'list' ? <LayoutList className="size-6" /> : <LayoutGrid className="size-6" />}
          </SelectTrigger>
          <SelectContent>
            {active === 'list' && (
              <SelectItem value="grid">
                <LayoutGrid height={24} width={24} />
              </SelectItem>
            )}
            {active === 'grid' && (
              <SelectItem value="list">
                <LayoutList height={24} width={24} />
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
