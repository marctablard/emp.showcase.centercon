'use client';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {z} from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";

export default function Register() {
    const t = useTranslations('register');

    const registrationData = z.object({
        registrationType: z.any(),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        emailConfirmation: z.string().email(),
        companyName: z.string(),
        businessType: z.string(),
        street: z.string(),
        houseNumber: z.string(),
        postalCode: z.string(),
        city: z.string(),
        country: z.string(),
        vatNumber: z.string(),
        shippingSameAsBilling: z.boolean(),
        username: z.string(),
        password: z.string(),
        passwordConfirmation: z.string(),
        newsletter: z.boolean(),
        dealsAlerts: z.boolean(),
    }).required({
        registrationType: true,
        firstName: true,
        lastName: true,
        email: true,
        emailConfirmation: true,
        street: true,
        houseNumber: true,
        postalCode: true,
        city: true,
        country: true,
        username: true,
        password: true,
        passwordConfirmation: true,
    });

    const form = useForm<z.infer<typeof registrationData>>({
        resolver: zodResolver(registrationData),
        defaultValues: {
            registrationType: '',
            firstName: '',
            lastName: '',
            email: '',
            emailConfirmation: '',
            companyName: '',
            businessType: '',
            street: '',
            houseNumber: '',
            postalCode: '',
            city: '',
            country: '',
            vatNumber: '',
            shippingSameAsBilling: true,
            username: '',
            password: '',
            passwordConfirmation: '',
            newsletter: false,
            dealsAlerts: false,
        },
    })

    function onSubmit(values: z.infer<typeof registrationData>) {
        // Todo: implement API call
        console.log(values)
    }

    return (
        <div className="flex flex-col items-center">
            <Card
                className="w-full sm:w-[584px] sm:mt-[104px] sm:rounded-xl sm:border sm:shadow-sm rounded-none border-0 shadow-none gap-16">
                <CardHeader className="gap-0">
                    <CardTitle>
                        <h3>{t('title')}</h3>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="register-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-12">
                            <Accordion type="multiple" className="flex flex-col gap-12" defaultValue={["item-1"]}>
                                <AccordionItem value="item-1">
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
                                                control={form.control}
                                                name="registrationType"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="registrationType">{t('registrationType')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="registrationType" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="firstName">{t('firstName')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="firstName" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="lastName">{t('lastName')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="lastName" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="email">{t('email')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="email" type="email" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="emailConfirmation"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="emailConfirmation">{t('emailConfirmation')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="emailConfirmation" type="email" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>
                                        <p className="text-base">{t('addressInfo')}</p>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col gap-4 mb-4">
                                            <p className="text-slate-600 text-sm">{t('addressDetails')}</p>
                                            <hr />
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="companyName"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="companyName">{t('companyName')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="companyName" type="text" {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="businessType"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="businessType">{t('businessType')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="businessType" type="text" {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="street"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="street">{t('street')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="street" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="houseNumber"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="houseNumber">{t('houseNumber')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="houseNumber" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="postalCode"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="postalCode">{t('postalCode')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="postalCode" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="city">{t('city')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="city" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="country"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="country">{t('country')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="country" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="vatNumber"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="vatNumber">{t('vatNumber')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="vatNumber" type="text" {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="shippingSameAsBilling"
                                                render={({field}) => (
                                                    <FormItem className="flex flex-row items-center gap-2">
                                                        <FormControl>
                                                            <Checkbox id="shippingSameAsBilling" checked={field.value} onCheckedChange={field.onChange}/>
                                                        </FormControl>
                                                        <FormLabel htmlFor="shippingSameAsBilling">{t('shippingSameAsBilling')}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                <AccordionItem value="item-3">
                                    <AccordionTrigger>
                                        <p className="text-base">{t('accountSettings')}</p>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="flex flex-col gap-4 mb-4">
                                            <p className="text-slate-600 text-sm">{t('accountDetails')}</p>
                                            <hr />
                                        </div>
                                        <div className="space-y-4">
                                            <FormField
                                                control={form.control}
                                                name="username"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="username">{t('username')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="username" type="text" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="password">{t('password')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="password" type="password" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="passwordConfirmation"
                                                render={({field}) => (
                                                    <FormItem>
                                                        <FormLabel htmlFor="passwordConfirmation">{t('passwordConfirmation')}</FormLabel>
                                                        <FormControl>
                                                            <Input id="passwordConfirmation" type="password" required {...field}/>
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="flex flex-col gap-4">
                                <h4>{t('emailSignup')}</h4>
                                <FormField
                                    control={form.control}
                                    name="newsletter"
                                    render={({field}) => (
                                        <FormItem className="flex flex-row items-center gap-2">
                                            <FormControl>
                                                <Checkbox id="newsletter" checked={field.value} onCheckedChange={field.onChange}/>
                                            </FormControl>
                                            <FormLabel htmlFor="newsletter">{t('newsletter')}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dealsAlerts"
                                    render={({field}) => (
                                        <FormItem className="flex flex-row items-center gap-2">
                                            <FormControl>
                                                <Checkbox id="dealsAlerts" checked={field.value} onCheckedChange={field.onChange}/>
                                            </FormControl>
                                            <FormLabel htmlFor="dealsAlerts">{t('dealsAlerts')}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-6">
                    <p>{t('termsNotice')}</p>
                    <Button type="submit" form="register-form" className="w-full">{t('registerButton')}</Button>
                    <p>{t('alreadyHaveAccount')} <Link href="/login">{t('logIn')}</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
}