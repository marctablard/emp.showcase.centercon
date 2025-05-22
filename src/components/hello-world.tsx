import { HelloService } from "@/platform/services/hello/HelloService";

export async function HelloWorld() {
    const helloService = await globalThis.EMP.platform.server.get<HelloService>("HelloService");
    const message = await helloService.sayHello();
    return (
        <div>
            <p>{message}</p>
        </div>
    );
}