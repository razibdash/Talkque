export type TelephonyProviderName = 'twilio' | 'telnyx';

export interface TelephonyProvider {
  name: TelephonyProviderName;
  placeCall(to: string, from: string, webhookUrl: string): Promise<{ callId: string }>;
}
