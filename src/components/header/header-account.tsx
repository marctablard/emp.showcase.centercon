'use client';

import useAuthentication from "@/hooks/authentication/useAuthentication";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
export default function HeaderAccount() {
    const t = useTranslations('header');
    const { isAuthenticated, loading } = useAuthentication();
    if  (loading) {
        return null;
    };
    return (
        <div>
            
            {isAuthenticated ? (
                <Button className="py-4" variant="outline">
                    <Link href="/account">{t('account')}</Link>
                  </Button>
            ) : (
                <Button className="py-4" variant="outline">
                    <Link href="/login">{t('signIn')}</Link>
                  </Button>
            )}
        </div>
    );
}