import services from '@/platform/services';
import { HelloService } from '@/platform/services/hello/HelloService';

export async function HelloWorldComponent() {
  const helloService = await services.get<HelloService>('HelloService');
  const message = await helloService.sayHello();
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}
