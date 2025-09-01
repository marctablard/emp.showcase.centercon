'use client';

import dynamic from 'next/dynamic';
import { CMSComponent } from '@/platform/services/model/cms';

// Dynamically import components
const Hero = dynamic(() => import('./hero'));
const QuickEntry = dynamic(() => import('./quick-entry'));

// Map of component types to their React components
const componentMap: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  'quick-entry': QuickEntry,
};

interface CMSComponentRendererProps {
  components: CMSComponent[];
}

/**
 * Renders CMS components based on their type
 */
export default function CMSComponentRenderer({ components }: CMSComponentRendererProps) {
  return (
    <>
      {components.map((component) => {
        const Component = componentMap[component.type];

        if (!Component) {
          console.warn(`Component type "${component.type}" not found`);
          return null;
        }

        return <Component key={component.id} {...component} />;
      })}
    </>
  );
}
