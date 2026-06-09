# Providers

Third-party services are accessed through contracts in `lib/providers`.

## Categories

- Voice orchestration: LiveKit, Retell, optional Vapi
- LLM inference: Groq, OpenAI
- Embeddings: OpenAI, optional Cohere
- Speech-to-text: Deepgram
- Text-to-speech: ElevenLabs
- Telephony: Twilio, optional Telnyx
- Messaging: WhatsApp Cloud API
- Billing: Stripe by default

Application code should depend on provider interfaces, not SDK-specific response objects. Webhooks should be verified first, normalized into Talkque events, and processed idempotently.
