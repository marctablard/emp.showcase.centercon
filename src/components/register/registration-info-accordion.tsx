'use client';

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Control } from "react-hook-form";

interface RegistrationInfoAccordionProps {
    control: Control<any>;
}

export function RegistrationInfoAccordion({ control }: RegistrationInfoAccordionProps) {
    const t = useTranslations('register');

    return (
        <AccordionItem value="registration-info">
            <AccordionTrigger>
                <p className="text-base">{t('registrationInfo')}</p>
            </AccordionTrigger>
            <AccordionContent>
                <div className="flex flex-col gap-4 mb-4">
                    <p className="text-slate-600 text-sm">{t('personalDetails')}</p>
                    <hr />
                </div>
                <div className="space-y-4">
                    <FormField
                        control={control}
                        name="registrationType"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel htmlFor="registrationType">{t('registrationType')}</FormLabel>
                                <FormControl>
                                    <Input id="registrationType" type="text" required {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="firstName"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel htmlFor="firstName">{t('firstName')}</FormLabel>
                                <FormControl>
                                    <Input id="firstName" type="text" required {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="lastName"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel htmlFor="lastName">{t('lastName')}</FormLabel>
                                <FormControl>
                                    <Input id="lastName" type="text" required {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="email"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel htmlFor="email">{t('email')}</FormLabel>
                                <FormControl>
                                    <Input id="email" type="email" required {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="emailConfirmation"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel htmlFor="emailConfirmation">{t('emailConfirmation')}</FormLabel>
                                <FormControl>
                                    <Input id="emailConfirmation" type="email" required {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </AccordionContent>
        </AccordionItem>
    );
}
