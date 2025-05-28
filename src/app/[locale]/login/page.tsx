import LoginCard from "@/components/login/login-card";

export default async function Login({ params }: { params: Promise<{ locale: string, callbackUrl: string }> }) {
    const { locale : _locale, callbackUrl } = await params;
    return (
        <div className="flex flex-col items-center">
            <LoginCard callbackUrl={callbackUrl} />
        </div>
    );
}