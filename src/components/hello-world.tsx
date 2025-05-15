import { HelloService } from "@/platform/services/hello/HelloService";
import services from "@/platform/services";

export async function HelloWorld() {
    const helloService = await services.get<HelloService>("HelloService");
    const message = await helloService.sayHello();
    return (
        <div>
            <p>{message}</p>
        </div>
    );
}