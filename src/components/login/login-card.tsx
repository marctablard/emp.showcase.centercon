'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthentication } from "@/hooks/authentication/use-authentication";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const loginData = z.object({
    username: z.string(),
    password: z.string(),
});

type LoginData = z.infer<typeof loginData>;

export default function LoginCard() {
    const t = useTranslations('login');
    const router = useRouter();
    const { login, isAuthenticated, isLoading } = useAuthentication();
    const [error, setError] = useState<string | null>(null);
    const top = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (error && top.current) {
            top.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [error]);

    const form = useForm<LoginData>({
        resolver: zodResolver(loginData),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    async function onSubmit(values: LoginData) {
        setError(null);
        
        try {
            const success = await login(values.username, values.password);
            
            if (success) {
                // Redirect to home page or dashboard after successful login
                router.push('/');
            } else {
                setError(t('invalidCredentials'));
            }
        } catch (err) {
            setError(t('loginError'));
            console.error(err);
        }
    }

    return (
        <Card className="w-full sm:w-[366px] sm:my-[104px] sm:rounded-xl sm:border sm:shadow-sm rounded-none border-0 shadow-none">
            <CardHeader className="gap-0" ref={top}>
                <CardTitle>
                    <h3>{t('title')}</h3>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        {error}
                                    </AlertDescription>
                                </Alert>
                            )}
                            
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="username">{t('username')}</FormLabel>
                                        <FormControl>
                                            <Input id="username" type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="password">{t('password')}</FormLabel>
                                        <FormControl>
                                            <Input id="password" type="password" {...field} />
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
                <Button 
                    type="submit" 
                    form="login-form" 
                    className="w-full"
                    disabled={isLoading}
                >
                    {isLoading ? t('loggingIn') : t('continue')}
                </Button>
            </CardFooter>
        </Card>
    );
}
