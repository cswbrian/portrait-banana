// Read the current ai-service.ts file
const fs = require('fs');
const content = fs.readFileSync('lib/ai-service.ts', 'utf8');

// Add debugging and fix response parsing
const updatedContent = content.replace(
  `    const data = await response.json();
    
    // Extract the generated image from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content;
      const imagePart = content.parts?.find((part: any) => part.inline_data);
      
      if (imagePart && imagePart.inline_data) {
        return {
          imageData: imagePart.inline_data.data,
        };
      }
    }

    throw new Error('No image generated in response');`,
  `    const data = await response.json();
    
    // Debug: Log the response structure
    console.log('=== GEMINI API RESPONSE DEBUG ===');
    console.log('Response keys:', Object.keys(data));
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    // Extract the generated image from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const content = data.candidates[0].content;
      console.log('Content:', JSON.stringify(content, null, 2));
      
      if (content.parts) {
        console.log('Parts found:', content.parts.length);
        content.parts.forEach((part, index) => {
          console.log(\`Part \${index}:\`, JSON.stringify(part, null, 2));
        });
        
        // Try both inline_data and inlineData formats
        const imagePart = content.parts.find((part: any) => 
          part.inline_data || part.inlineData
        );
        
        if (imagePart) {
          const imageData = imagePart.inline_data?.data || imagePart.inlineData?.data;
          if (imageData) {
            console.log('Image data found, length:', imageData.length);
            return {
              imageData: imageData,
            };
          }
        }
      }
    }

    console.log('=== NO IMAGE FOUND IN RESPONSE ===');
    throw new Error('No image generated in response');`
);

// Write the updated content back
fs.writeFileSync('lib/ai-service.ts', updatedContent);
console.log('AI service updated with debugging and improved response parsing');
