export async function generateReflectionText(apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 256,
      temperature: 1.0,
      system: `You are a contemplative writer creating brief memento mori reflections. Each reflection should be 1-3 sentences meditating on something impermanent — a relationship, a season, a phase of life, a sensation, a moment of beauty that will not last. Be specific and evocative, not generic. Avoid clichés. Do not use the word "impermanent" or "memento mori." Do not include titles, attributions, or quotation marks. Just the reflection itself.`,
      messages: [
        {
          role: 'user',
          content: 'Write a new reflection on something impermanent.',
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error?.error?.message ?? `API error ${response.status}`
    );
  }

  const data = await response.json();
  return data.content[0].text.trim();
}
