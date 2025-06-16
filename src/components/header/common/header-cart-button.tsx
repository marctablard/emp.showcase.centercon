import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function HeaderCartButton() {
  return (
    <Button className="pl-4 pr-1 py-1 gap-4 self-center">
      <span className="text-xl">0,00 €</span>
      <div className="flex items-center w-[43px] h-[35px] relative">
        <Badge variant="white" className="h-5 min-w-5 rounded-full px-1 tabular-nums absolute top-0 right-0">
          15
        </Badge>
        <ShoppingCart width="32" height="32" />
      </div>
    </Button>
  );
}
