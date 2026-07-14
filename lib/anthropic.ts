// Direct fetch against the Claude Messages API — the official SDK doesn't
// support React Native. See lib/constants.ts for the model choice rationale.
export const CLAUDE_MODEL = 'claude-opus-4-8';

const SYSTEM_PROMPT = `You are a contemplative writer creating brief memento mori reflections. Each reflection is 1-3 sentences meditating on something impermanent — a relationship, a season, a phase of life, a sensation, a moment of beauty that will not last. Be specific and evocative, not generic. Avoid clichés. Vary your subject, structure, and phrasing widely from one reflection to the next; reach for the unexpected image rather than the obvious one. Do not use the words "impermanent" or "memento mori." Do not include titles, attributions, or quotation marks. Return only the reflection itself.`;

interface ContentBlock {
  type: string;
  text?: string;
}

export async function generateReflectionText(apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: SYSTEM_PROMPT,
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
    throw new Error(error?.error?.message ?? `API error ${response.status}`);
  }

  const data = await response.json();

  // A safety refusal (or any non-text response) has no text block — throw so
  // the caller falls back to a curated reflection.
  const textBlock = (data.content as ContentBlock[] | undefined)?.find(
    (block) => block.type === 'text' && typeof block.text === 'string'
  );
  const text = textBlock?.text?.trim();
  if (!text) {
    throw new Error('No reflection was returned.');
  }
  return text;
}
