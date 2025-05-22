'use client';

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import {z} from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

export default function Login() {
    const t = useTranslations('login');

    const loginData = z.object({
        username: z.string(),
        password: z.string(),
    });

    const form = useForm<z.infer<typeof loginData>>({
        resolver: zodResolver(loginData),
        defaultValues: {
            username: '',
            password: '',
        },
    })

    function onSubmit(values: z.infer<typeof loginData>) {
        // Todo: implement API call
        console.log(values)
    }

    return (
        <div className="flex flex-col items-center">
            <Card className="w-full sm:w-[366px] sm:mt-[104px] sm:rounded-xl sm:border sm:shadow-sm rounded-none border-0 shadow-none">
                <CardHeader className="gap-0">
                    <CardTitle>
                        <h3>{t('title')}</h3>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({field}) => (
                                        <FormItem>
                                            <FormLabel htmlFor="username">{t('username')}</FormLabel>
                                            <FormControl>
                                                <Input id="username" type="text" {...field}/>
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
                                                <Input id="password" type="password" {...field}/>
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Link href="/">{t('forgotPassword')}</Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <Button type="submit" form="login-form" className="w-full">{t('continue')}</Button>
                </CardFooter>
            </Card>
        </div>
    );
}