import { Skeleton } from '@/components/ui/skeleton';

export function ProductTileListItemSkeleton() {
  return (
    <div className="flex h-25 w-full flex-col rounded pr-6 shadow-sm">
      <div className="flex h-full w-full items-center gap-16 self-center">
        <div className="flex h-full w-full items-center gap-6">
          <div className="flex w-1/2 items-center gap-6">
            <div className="h-25 w-25">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex w-5/6 flex-col gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="flex w-1/2">
            <div className="flex w-4/12 flex-col justify-center gap-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-2/4" />
            </div>
            <div className="flex w-3/12 items-center">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex w-5/12 items-center gap-4">
              <Skeleton className="h-12 w-38.5" />
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>
        </div>
        <Skeleton className="h-6 w-6" />
      </div>
    </div>
  );
}
