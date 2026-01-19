# Token Personality Builder

Complete guide to the user-owned personality system.

## Overview

The Token Personality Builder is a tool that allows users to create unique personalities for their token's Telegram bot. **This is 100% user-owned**—Kogaion only provides the builder. The final system prompt, traits, and branding are entirely controlled by the user.

## Key Principle

**User Ownership**: Every aspect of the token bot's personality is user-defined. Kogaion never injects its own voice or branding into token bots. The platform only provides:
- Builder tools (UI components)
- Preset templates (starting points)
- Storage (encrypted bot tokens, persona data)
- Infrastructure (HuggingFace API, worker service)

## Components

### 1. Preset Tab

Users can select from 5 preset personas:
- **Fire**: Aggressive, energetic, hype-driven
- **Frost**: Calm, analytical, professional
- **Blood**: Dark, mysterious, edgy
- **Moon**: Hopeful, optimistic, dreamy
- **Stone**: Stable, reliable, grounded

**Important**: Presets are starting points only. Users can edit everything after selection.

### 2. Custom Tab

Users can start from scratch and build a completely custom personality.

### 3. System Prompt Editor

- **Always editable**: Users can modify the final system prompt at any time
- **User-owned**: This is the exact prompt used by the bot
- **No Kogaion injection**: Platform never adds its own voice

### 4. Style Sliders

Five dimensions (0-100):
- **Chaos**: How unpredictable/responsive
- **Friendliness**: How warm/approachable
- **Formality**: How professional/casual
- **Aggression**: How bold/assertive
- **Humor**: How playful/serious

### 5. Branding

- **Catchphrases**: Comma-separated list
- **Emojis**: Comma-separated list
- **Voice Style**: Text description
- **Do List**: What the bot should do
- **Don't List**: What the bot should avoid

### 6. Rules

- **Allowed Topics**: What the bot can discuss
- **Forbidden Topics**: What the bot must avoid

### 7. Live Preview

- Uses HuggingFace API (no Telegram needed)
- Tests persona in real-time
- Shows how bot will respond

## Data Storage

### Database Schema

```prisma
model BotPersona {
  systemPrompt String  // User-owned final prompt
  traitsJson String
  tone String
  allowed String?
  forbidden String?
  personaStyleJson String?  // { chaos, friendliness, formality, aggression, humor }
  brandingJson String?      // { catchphrases, emojis, voiceStyle, doList, dontList }
  presetUsed String?        // Which preset was used (or "custom")
}
```

### Encryption

- Bot tokens encrypted with AES-256-GCM
- Encryption key: `ENCRYPTION_KEY` (same in web + worker)
- Never stored in plaintext

## API Flow

### 1. User Builds Persona

- Uses Token Personality Builder UI
- Selects preset or builds custom
- Edits system prompt
- Adjusts sliders, branding, rules
- Tests with live preview

### 2. User Activates Bot

- Provides BotFather token
- Pays 0.1 SOL to treasury
- Persona data saved to database
- Bot token encrypted and stored

### 3. Worker Loads Bot

- Worker reads persona from database
- Uses **user's system prompt** (not Kogaion)
- Decrypts bot token
- Starts Telegram bot with user's persona

## Separation of Concerns

### Kogaion Platform Helper

- **System Prompt**: Strict platform guide only
- **Role**: Help users understand Kogaion features
- **Voice**: Mythic but readable, helpful
- **Never**: Acts as token bot, leaks secrets, represents tokens

### User Token Bots

- **System Prompt**: 100% user-defined
- **Role**: Represent the user's token
- **Voice**: Whatever user defines
- **Never**: Contains Kogaion branding or voice

## Example Personas

### Fire Preset (Starting Point)

```json
{
  "systemPrompt": "You are an aggressive, hype-driven token bot...",
  "traits": ["aggressive", "energetic", "hype", "bold"],
  "tone": "aggressive",
  "style": { "chaos": 80, "friendliness": 60, "formality": 20, "aggression": 90, "humor": 70 },
  "branding": {
    "catchphrases": ["LFG!", "To the moon!"],
    "emojis": ["🔥", "🚀"],
    "voiceStyle": "Bold and energetic"
  }
}
```

User can edit `systemPrompt` to: "You are a calm, professional token bot..." and it becomes completely different.

## Best Practices

### For Users

1. **Start with Preset**: Use a preset as a starting point
2. **Edit Freely**: Modify system prompt to match your vision
3. **Test with Preview**: Use live preview before activating
4. **Define Rules**: Set clear allowed/forbidden topics
5. **Brand Consistently**: Use catchphrases and emojis that match your token

### For Developers

1. **Never Inject Kogaion Voice**: Bot personas are user-owned
2. **Preserve User Data**: Don't modify system prompts
3. **Encrypt Sensitive Data**: Bot tokens must be encrypted
4. **Separate Concerns**: Platform helper ≠ token bots
5. **Document Ownership**: Make it clear users own their personas

## Troubleshooting

### Bot Not Using Persona

- Check database: `persona.systemPrompt` should be user's prompt
- Check worker logs: Should show "Bot started" with correct tokenMint
- Verify encryption key matches in web + worker

### Preview Not Working

- Check `HUGGINGFACE_API_KEY` is set
- Verify API key has inference permissions
- Check network connectivity

### Persona Not Saving

- Verify all required fields are provided
- Check database connection
- Review API logs for errors

---

**Last Updated**: 2024-01-01
