import { ShoppingCart } from 'lucide-react';
import HeaderNavigation from '@/components/header/header-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HeaderBottomBar() {
  return (
    <div className="flex justify-between pt-3">
      <HeaderNavigation />

      <Button className="pl-4 pr-1 py-1 gap-4">
        <span>0,00 €</span>
        <div className="flex items-center w-[43px] h-[35px] relative">
          <Badge variant="white" className="h-5 min-w-5 rounded-full px-1 tabular-nums absolute top-0 right-0">
            15
          </Badge>
          <ShoppingCart width="32" height="32" />
        </div>
      </Button>
    </div>
  );
}
