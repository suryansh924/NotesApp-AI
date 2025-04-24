export const generateContent = async (prompt: string): Promise<string> => {
  try {
    const systemPrompt = `You are a helpful assistant specialized in creating well-structured notes. 
    Format your responses with clear headings, bullet points, and other Markdown formatting to enhance readability.
    Use appropriate hierarchy with headings (## for main sections, ### for subsections).
    Use lists (bullet points or numbered) for sequential information or items.
    Emphasize key points with **bold** or *italic* text when appropriate.
    Add code blocks for any technical content with proper syntax highlighting.
    Keep paragraphs concise and focused on one idea.
    Include a brief summary at the beginning when appropriate.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
};


export const generateProductivityTemplate = async (request: string): Promise<string> => {
  try {
    // Customize the prompt to work with your editor's limitations
    const systemPrompt = `You are a productivity expert specialized in creating detailed, well-structured templates and roadmaps.
    
    Create templates that work with basic formatting only (no tables or checkboxes). Use these formatting elements only:
    - Headings (# ## ###)
    - Bold text (**text**)
    - Italic text (*text*)
    - Bullet lists (- item)
    - Numbered lists (1. item)
    - Block quotes (> text)
    - Code blocks (\`\`\`code\`\`\`)
    
    For tracking elements that would normally use checkboxes, use:
    - [ ] Not completed (as plain text, not expecting it to be interactive)
    - [x] Completed (as plain text, not expecting it to be interactive)
    
    For data organization that would normally use tables, use:
    - Hierarchical bullet points
    - Clear headings to separate columns
    - Consistent indentation for visual structure
    
    Focus on the content organization and create practical, actionable templates for:
    - Habit tracking
    - Goal setting
    - Project management
    - Knowledge organization
    - Time blocking
    - Personal development
    
    Include clear instructions at the beginning explaining how to use the template.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating productivity template:', error);
    throw error;
  }
};



export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const prompt = `Please provide a concise summary of the following text, highlighting the key points and maintaining the main structure. Format the summary with appropriate Markdown to enhance readability:\n\n${text}`;
    const summary = await generateContent(prompt);
    return summary;
  } catch (error) {
    console.error('Error summarizing text:', error);
    throw error;
  }
};