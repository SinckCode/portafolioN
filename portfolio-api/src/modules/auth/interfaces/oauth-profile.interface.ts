export interface OAuthProfile {
  provider: 'google' | 'github';
  providerId: string;
  email: string;
  name: string;
  avatar: string;
}
