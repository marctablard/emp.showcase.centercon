'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';

export interface SearchLayoutToggleProps {
  active: 'list' | 'grid';
  onSelectLayout: (selectedLayout: 'list' | 'grid') => void;
}

export function SearchLayoutToggle({ active, onSelectLayout }: SearchLayoutToggleProps) {
  const t = useTranslations('search.layoutToggle');

  return (
    <>
      <div className="hidden gap-1 sm:flex">
        <Button
          variant="iconSelector"
          data-active={active === 'list'}
          onClick={() => onSelectLayout('list')}
          aria-label={t('list')}
        >
          <LayoutList height={24} width={24} />
        </Button>
        <Button
          variant="iconSelector"
          data-active={active === 'grid'}
          onClick={() => onSelectLayout('grid')}
          arial-label={t('grid')}
        >
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
