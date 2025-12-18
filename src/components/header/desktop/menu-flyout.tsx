'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { HeaderPromo } from '@/components/header/common/header-promo';
import { MenuItem, SubMenuItem } from '@/data/navigation-menu';
import { cn } from '@/lib/utils';

interface DesktopMenuFlyoutProps {
  menuItem: MenuItem;
  onMouseLeave?: () => void;
}

export function DesktopMenuFlyout({ menuItem, onMouseLeave }: DesktopMenuFlyoutProps) {
  const [hoveredSubItem, setHoveredSubItem] = useState<SubMenuItem | null>(null);

  const submenuItems = menuItem.submenuItems ?? [];
  const thirdLevelItems = hoveredSubItem?.submenuItems ?? [];

  const handleSubItemClick = (item: SubMenuItem) => {
    if (hoveredSubItem === item) {
      setHoveredSubItem(null);
    } else {
      setHoveredSubItem(item);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 mt-6 mb-4" onMouseLeave={onMouseLeave}>
      <ul>
        {/* 2nd level */}
        {submenuItems.map((item, index) => (
          <li key={index}>
            {item.href && !item.hasSubmenu ? (
              <>
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-4 py-2 text-md font-bold rounded-sm hover:bg-surface-action-hover-2"
                  onMouseEnter={() => setHoveredSubItem(null)}
                >
                  {item.label}
                </Link>
              </>
            ) : (
              <>
                <button
                  className={cn(
                    'w-full flex items-center px-4 py-2 text-md font-bold cursor-pointer rounded-sm hover:bg-surface-action-hover-2',
                    hoveredSubItem === item && 'bg-surface-action-hover-2',
                  )}
                  onMouseEnter={() => setHoveredSubItem(item)}
                  onClick={() => handleSubItemClick(item)}
                >
                  {item.label}
                  <ChevronRight className="w-5 h-5 ms-1" />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {/* 3rd level */}
      <ul className="ps-2 border-s-1 border-s-border-subtle">
        {thirdLevelItems.map((item, index) => (
          <li key={index}>
            {item.href && (
              <>
                <Link
                  href={item.href}
                  className="flex items-center justify-between px-4 py-2 text-md rounded-sm hover:bg-surface-action-hover-2"
                >
                  {item.label}
                </Link>
              </>
            )}
          </li>
        ))}
      </ul>
      <HeaderPromo className="col-span-2 col-start-3" />
    </div>
  );
}
