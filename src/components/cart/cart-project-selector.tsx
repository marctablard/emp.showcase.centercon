'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { FolderKanban, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project } from '@/platform/services/model/project/project';

interface CartProjectSelectorProps {
  cartId: string;
  /** Pre-selected project ID (e.g. from shopping list context) */
  initialProjectId?: string;
  onProjectSelected?: (projectId: string | null) => void;
}

const PROJECT_CART_STORAGE_KEY = 'emporix_cart_project';

export function CartProjectSelector({ cartId, initialProjectId, onProjectSelected }: CartProjectSelectorProps) {
  const t = useTranslations('account.projects.projectSelector');
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialProjectId) return initialProjectId;
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PROJECT_CART_STORAGE_KEY + cartId) ?? null;
    }
    return null;
  });

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        const open = (data as Project[]).filter((p) => p.status === 'open');
        setProjects(open);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      const newId = value === '__none__' ? null : value;
      setSelectedId(newId);
      if (typeof window !== 'undefined') {
        if (newId) {
          localStorage.setItem(PROJECT_CART_STORAGE_KEY + cartId, newId);
        } else {
          localStorage.removeItem(PROJECT_CART_STORAGE_KEY + cartId);
        }
      }
      onProjectSelected?.(newId);
    },
    [cartId, onProjectSelected],
  );

  const handleClear = () => handleSelect('__none__');

  if (loading || projects.length === 0) return null;

  const selectedProject = projects.find((p) => p.id === selectedId);
  const selectedName = selectedProject
    ? ((selectedProject.name as Record<string, string>)?.[locale] ??
      (selectedProject.name as Record<string, string>)?.en ??
      selectedProject.id)
    : undefined;

  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-surface-secondary rounded-md border border-border-primary">
      <FolderKanban className="h-4 w-4 text-text-secondary shrink-0" />
      <div className="flex-1 min-w-0">
        <Label className="text-xs text-text-secondary mb-1 block">{t('label')}</Label>
        <Select value={selectedId ?? '__none__'} onValueChange={handleSelect}>
          <SelectTrigger className="h-8 text-sm bg-surface-page">
            <SelectValue placeholder={t('placeholder')}>{selectedName ?? t('placeholder')}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">{t('placeholder')}</SelectItem>
            {projects.map((p) => {
              const name =
                (p.name as Record<string, string>)?.[locale] ?? (p.name as Record<string, string>)?.en ?? p.id;
              return (
                <SelectItem key={p.id} value={p.id}>
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      {selectedId && (
        <Button
          variant="neutral"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleClear}
          title={t('clearSelection')}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
