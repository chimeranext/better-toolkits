# Social Publishing Skill — Multi-Tool Reference (B2C / organic awareness)

## Purpose

This skill covers **organic/owned-media publishing** across social platforms using the **Publora MCP** (`mcp.publora.com`) — the complementary "Awareness" channel to paid media in the AAARRR funnel.

## Capabilities

- **Cross-platform posting**: schedule/publish to LinkedIn, X, Facebook, Instagram, Threads, TikTok, YouTube, Bluesky, Mastodon, Telegram
- **Media**: upload/attach media (S3 presigned), Instagram cover, YouTube thumbnail
- **Analytics**: engagement stats (Mastodon/Bluesky), LinkedIn engagement via REST
- **Account context**: connections, quota, schedule horizon
- **Agency/Company tools**: 48 company tools for client work

## Usage

Register `publora` in `opencode.json`:

```jsonc
{ "mcp": { "servers": { "publora": {
  "type": "remote", "url": "https://mcp.publora.com/mcp",
  "headers": { "Authorization": "Bearer {env:PUBLORA_API_KEY}" } } } } }
```

Then agents can "schedule this announcement to LinkedIn for tomorrow 9am".

## References

- https://docs.publora.com/guides/mcp-server
