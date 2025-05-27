'use client';

import { Checkbox } from "@/components/ui/checkbox";
import {FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";

interface EmailSignupSectionProps {
    control: Control<any>;
}

export function EmailSignupSection({ control }: EmailSignupSectionProps) {
    const t = useTranslations('register');

    return (
        <div className="flex flex-col gap-4">
            <h4>{t('emailSignup')}</h4>
            <FormField
                control={control}
                name="newsletter"
                render={({field}) => (
                    <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                            <Checkbox id="newsletter" checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel htmlFor="newsletter">{t('newsletter')}</FormLabel>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="dealsAlerts"
                render={({field}) => (
                    <FormItem className="flex flex-row items-center gap-2">
                        <FormControl>
                            <Checkbox id="dealsAlerts" checked={field.value} onCheckedChange={field.onChange}/>
                        </FormControl>
                        <FormLabel htmlFor="dealsAlerts">{t('dealsAlerts')}</FormLabel>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
