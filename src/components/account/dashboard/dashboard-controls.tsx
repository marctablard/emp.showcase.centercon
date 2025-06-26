'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Lock, RotateCcw, Settings, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useConfigStore } from '@/lib/client/dashboard';

interface DashboardControlsProps {
  className?: string;
  isCustomizableInitial: boolean;
  onIsCustomizableChanged: (isCustomizable: boolean) => void;
}

export default function DashboardControls({
  className,
  isCustomizableInitial,
  onIsCustomizableChanged,
}: DashboardControlsProps) {
  const t = useTranslations('Account');
  const [isCustomizable, setIsCustomizable] = useState(isCustomizableInitial);
  const { resetLayouts } = useConfigStore();

  const handleCustomizable = () => {
    if (onIsCustomizableChanged) {
      onIsCustomizableChanged(!isCustomizable);
    }
    setIsCustomizable(!isCustomizable);
  };

  return (
    <div className={className}>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="flex items-center" aria-label={t('settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="mr-4">
          <DropdownMenuLabel>{t('dashboardSettings')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetLayouts} className="cursor-pointer">
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('resetLayout')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCustomizable} className="cursor-pointer flex items-center">
            {isCustomizable ? <Unlock className="h-4 w-4 mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
            {t('customize')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
