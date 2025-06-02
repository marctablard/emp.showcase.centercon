export interface UserAgentService {
  getUserAgent(): Promise<string>;
}
