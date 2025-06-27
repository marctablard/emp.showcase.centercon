import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { ListFilter } from 'lucide-react';
import z from 'zod';
import { FilterValue as SearchFilterValue } from '@/hooks/useSearch';
import { Filter, FilterValue } from '@/platform/services/model/common';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { getMinMaxValues, hasUnitOfMeasurement, isNumberRange, isSelect } from './util/search';

interface SearchFilterProps {
  availableFilters: Filter[];
  activeFilters: Record<string, SearchFilterValue>;
  applyFacet: (facetId: string, value: string | string[]) => void;
  applyRangeFacet: (facetId: string, min: string, max: string) => void;
  resetFacet: (facetId: string) => void;
  resetAllFacets: () => void;
}

interface ActiveFiltersProps {
  activeFilters: Record<string, SearchFilterValue>;
  resetFacet: (facetId: string) => void;
  resetAllFacets: () => void;
}

function ActiveFilters({ activeFilters, resetFacet }: ActiveFiltersProps) {
  const t = useTranslations('product');
  const filters = Object.entries(activeFilters);
  console.log(filters);
  return (
    <div className="p-6 pt-10">
      {filters &&
        filters.map(([id, value]) => (
          <Button
            onClick={() => resetFacet(id)}
            className="p-2 bg-gray-300 rounded-xs mr-6 mb-6 text-black border-none"
            variant={'secondary'}
            key={id}
          >
            {t(`filters.${id}`)} X
          </Button>
        ))}
    </div>
  );
}

function FilterMenu({
  availableFilters,
  applyFacet,
  applyRangeFacet,
  // resetAllFacets,
  // resetFacet,
  activeFilters,
}: SearchFilterProps) {
  const t = useTranslations('product');
  // Create a dynamic schema based on available filters
  const createFormSchema = () => {
    const schemaFields: Record<string, any> = {};

    availableFilters.forEach(({ id, values }) => {
      const filterIdMin = `${id}_min`;
      const filterIdMax = `${id}_max`;
      if (isSelect(values)) {
        schemaFields[id] = z.string().optional();
        schemaFields[filterIdMin] = z.string().optional();
        schemaFields[filterIdMax] = z.string().optional();
      } else if (isNumberRange(values)) {
      } else if (hasUnitOfMeasurement(values)) {
        schemaFields[filterIdMin] = z.string().optional();
        schemaFields[filterIdMax] = z.string().optional();
      }
    });

    return z.object(schemaFields);
  };

  const FormSchemaInput = createFormSchema();

  // Create default values based on available filters
  const createDefaultValues = () => {
    const defaultValues: Record<string, any> = {};

    availableFilters.forEach(({ values, id }) => {
      if (isSelect(values)) {
        defaultValues[id] = values[0].id;
      }

      if (isNumberRange(values)) {
        defaultValues[`${id}_min`] = getMinMaxValues(values)[0];
        defaultValues[`${id}_max`] = getMinMaxValues(values)[1];
      }
    });

    return defaultValues;
  };

  const form = useForm<z.infer<typeof FormSchemaInput>>({
    resolver: zodResolver(FormSchemaInput),
    defaultValues: createDefaultValues(),
  });

  const onSubmit = (data: z.infer<ReturnType<typeof createFormSchema>>) => {};

  // Helper functions are now imported from util/search.ts

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        {availableFilters.map(({ id, values, name }) => {
          if (isNumberRange(values)) {
            const [min, max] = getMinMaxValues(values);

            const filterIdMin = `${id}_min`;
            const filterIdMax = `${id}_max`;
            // Get current values from form
            const minValue = form.watch(filterIdMin) || min;
            const maxValue = form.watch(filterIdMax) || max;

            return (
              <div key={id} className="space-y-2">
                <FormLabel>{t(`filters.${name}`)}</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {['min', 'max'].map((input) => (
                    <FormField
                      key={input}
                      name={`${id}_${input}`}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" placeholder={input.toUpperCase()} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <Slider
                  value={[Number(minValue), Number(maxValue)]}
                  min={min}
                  max={max}
                  step={1}
                  className="mt-2"
                  onValueChange={(values: number[]) => {
                    form.setValue(filterIdMin, String(values[0]));
                    form.setValue(filterIdMax, String(values[1]));

                    applyRangeFacet(id, form.getValues(filterIdMin), form.getValues(filterIdMax));
                  }}
                />
              </div>
            );
          }
          // Select filter type
          if (isSelect(values)) {
            return (
              <FormField
                key={id}
                name={id}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`filters.${name}`)}</FormLabel>
                    <Select
                      onValueChange={() => {
                        applyFacet(id, field.value);
                      }}
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {values.map((value) => (
                          <SelectItem key={value.id} value={value.id}>
                            {value.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          }

          return null;
        })}
        {/* Submit button */}
        <Button type="submit" className="w-full mt-4">
          Apply Filters
        </Button>
      </form>
    </Form>
  );
}
function SearchFilter({
  availableFilters,
  applyFacet,
  applyRangeFacet,
  resetAllFacets,
  resetFacet,
  activeFilters,
}: SearchFilterProps) {
  return (
    <span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={'secondary'}>
            {' '}
            <ListFilter /> Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 outline z-50 bg-white" align="end">
          <ActiveFilters {...{ activeFilters, resetAllFacets, resetFacet }} />
          <FilterMenu
            {...{ availableFilters, applyFacet, applyRangeFacet, resetAllFacets, resetFacet, activeFilters }}
          />
        </PopoverContent>
      </Popover>
      <Button onClick={resetAllFacets}>Clear Filter</Button>
    </span>
  );
}

export { SearchFilter };
