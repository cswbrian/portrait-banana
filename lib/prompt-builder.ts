import { CustomizationOptions } from '@/types';

/**
 * Advanced Prompt Builder for AI Portrait Generation
 * Provides sophisticated prompt engineering for different portrait styles
 */

export interface PromptContext {
  style: string;
  background: string;
  industry?: string;
  mood?: string;
  lighting?: string;
  composition?: string;
  additionalRequirements?: string[];
}

export interface PromptVariations {
  basic: string;
  detailed: string;
  technical: string;
  creative: string;
}

export class PromptBuilder {
  private static readonly STYLE_DESCRIPTIONS = {
    professional: {
      attire: 'professional business attire',
      expression: 'confident, approachable expression',
      styling: 'clean, polished look with modern styling',
      posture: 'upright, professional posture',
    },
    casual: {
      attire: 'smart casual attire',
      expression: 'friendly, approachable expression',
      styling: 'modern, relaxed professional styling',
      posture: 'natural, comfortable posture',
    },
    executive: {
      attire: 'executive-level professional attire',
      expression: 'authoritative, confident expression',
      styling: 'sophisticated, high-end professional styling',
      posture: 'commanding, authoritative posture',
    },
    creative: {
      attire: 'creative professional attire',
      expression: 'innovative, artistic expression',
      styling: 'contemporary, creative professional styling',
      posture: 'dynamic, creative posture',
    },
  };

  private static readonly BACKGROUND_DESCRIPTIONS = {
    office: {
      setting: 'professional office setting',
      elements: 'modern furniture, clean lines, corporate environment',
      lighting: 'professional office lighting with natural light',
      mood: 'business-focused, productive atmosphere',
    },
    studio: {
      setting: 'clean, minimalist studio background',
      elements: 'neutral backdrop, professional studio setup',
      lighting: 'soft, even studio lighting',
      mood: 'clean, professional, focused',
    },
    outdoor: {
      setting: 'outdoor professional setting',
      elements: 'natural environment, architectural elements',
      lighting: 'natural lighting with professional quality',
      mood: 'fresh, approachable, natural',
    },
    conference: {
      setting: 'conference room with modern corporate environment',
      elements: 'meeting room furniture, presentation equipment',
      lighting: 'professional conference room lighting',
      mood: 'collaborative, professional, meeting-ready',
    },
  };

  private static readonly INDUSTRY_CONTEXTS = {
    technology: 'tech industry professional, innovative, modern',
    finance: 'financial services professional, trustworthy, analytical',
    healthcare: 'healthcare professional, caring, knowledgeable',
    legal: 'legal professional, authoritative, trustworthy',
    education: 'educational professional, approachable, knowledgeable',
    consulting: 'consulting professional, analytical, strategic',
    marketing: 'marketing professional, creative, dynamic',
    sales: 'sales professional, confident, persuasive',
    general: 'business professional, versatile, competent',
  };

  /**
   * Build a comprehensive prompt for portrait generation
   */
  static buildPrompt(
    options: CustomizationOptions,
    context: Partial<PromptContext> = {}
  ): PromptVariations {
    const fullContext = this.buildContext(options, context);
    
    return {
      basic: this.buildBasicPrompt(fullContext),
      detailed: this.buildDetailedPrompt(fullContext),
      technical: this.buildTechnicalPrompt(fullContext),
      creative: this.buildCreativePrompt(fullContext),
    };
  }

  /**
   * Build context from options and additional parameters
   */
  private static buildContext(
    options: CustomizationOptions,
    context: Partial<PromptContext>
  ): PromptContext {
    return {
      style: options.style || 'professional',
      background: options.background || 'office',
      industry: context.industry || 'general',
      mood: context.mood || 'confident',
      lighting: context.lighting || 'professional',
      composition: context.composition || 'head-and-shoulders',
      additionalRequirements: context.additionalRequirements || [],
    };
  }

  /**
   * Build basic prompt for quick generation
   */
  private static buildBasicPrompt(context: PromptContext): string {
    const styleDesc = this.STYLE_DESCRIPTIONS[context.style as keyof typeof this.STYLE_DESCRIPTIONS];
    const bgDesc = this.BACKGROUND_DESCRIPTIONS[context.background as keyof typeof this.BACKGROUND_DESCRIPTIONS];
    const industry = this.INDUSTRY_CONTEXTS[(context.industry || 'general') as keyof typeof this.INDUSTRY_CONTEXTS];

    return `Transform this photo into a professional portrait.

Style: ${styleDesc.attire}, ${styleDesc.expression}
Background: ${bgDesc.setting} with ${bgDesc.lighting}
Industry: ${industry}

Generate a high-quality professional portrait suitable for business use.`;
  }

  /**
   * Build detailed prompt for high-quality generation
   */
  private static buildDetailedPrompt(context: PromptContext): string {
    const styleDesc = this.STYLE_DESCRIPTIONS[context.style as keyof typeof this.STYLE_DESCRIPTIONS];
    const bgDesc = this.BACKGROUND_DESCRIPTIONS[context.background as keyof typeof this.BACKGROUND_DESCRIPTIONS];
    const industry = this.INDUSTRY_CONTEXTS[(context.industry || 'general') as keyof typeof this.INDUSTRY_CONTEXTS];

    return `Transform this photo into a high-quality professional portrait.

REQUIREMENTS:
- ${styleDesc.attire} with ${styleDesc.styling}
- ${styleDesc.expression} and ${styleDesc.posture}
- Background: ${bgDesc.setting} featuring ${bgDesc.elements}
- Lighting: ${bgDesc.lighting} creating a ${bgDesc.mood} atmosphere
- Industry context: ${industry}
- High resolution with sharp details and professional color grading
- Maintain the person's facial features and identity
- Remove distracting elements from the original background
- Ensure the portrait looks natural and professional
- Suitable for business cards, LinkedIn profiles, and professional use

COMPOSITION: ${context.composition}
MOOD: ${context.mood}
LIGHTING: ${context.lighting}

${context.additionalRequirements && context.additionalRequirements.length > 0 
  ? `ADDITIONAL REQUIREMENTS:\n- ${context.additionalRequirements.join('\n- ')}`
  : ''
}

Generate a professional portrait that maintains the person's likeness while creating a polished, business-ready image.`;
  }

  /**
   * Build technical prompt for precise control
   */
  private static buildTechnicalPrompt(context: PromptContext): string {
    const styleDesc = this.STYLE_DESCRIPTIONS[context.style as keyof typeof this.STYLE_DESCRIPTIONS];
    const bgDesc = this.BACKGROUND_DESCRIPTIONS[context.background as keyof typeof this.BACKGROUND_DESCRIPTIONS];

    return `PROFESSIONAL PORTRAIT GENERATION SPECIFICATIONS:

INPUT ANALYSIS:
- Maintain facial features and identity
- Preserve natural skin tone and texture
- Keep authentic facial expressions

STYLING SPECIFICATIONS:
- Attire: ${styleDesc.attire}
- Expression: ${styleDesc.expression}
- Styling: ${styleDesc.styling}
- Posture: ${styleDesc.posture}

BACKGROUND SPECIFICATIONS:
- Setting: ${bgDesc.setting}
- Elements: ${bgDesc.elements}
- Lighting: ${bgDesc.lighting}
- Mood: ${bgDesc.mood}

TECHNICAL REQUIREMENTS:
- Resolution: High resolution with sharp details
- Color grading: Professional, natural skin tones
- Lighting: Even, professional lighting without harsh shadows
- Composition: ${context.composition} framing
- Background: Clean, uncluttered, professional
- Retouching: Subtle, natural-looking enhancements

OUTPUT SPECIFICATIONS:
- Format: High-quality digital image
- Use case: Business cards, LinkedIn, professional profiles
- Industry: ${context.industry || 'general business'}

Generate a technically precise professional portrait meeting all specifications.`;
  }

  /**
   * Build creative prompt for artistic generation
   */
  private static buildCreativePrompt(context: PromptContext): string {
    const styleDesc = this.STYLE_DESCRIPTIONS[context.style as keyof typeof this.STYLE_DESCRIPTIONS];
    const bgDesc = this.BACKGROUND_DESCRIPTIONS[context.background as keyof typeof this.BACKGROUND_DESCRIPTIONS];

    return `Create an innovative professional portrait that balances creativity with business appropriateness.

CREATIVE VISION:
- Style: ${styleDesc.attire} with a ${styleDesc.expression}
- Background: ${bgDesc.setting} that enhances the ${bgDesc.mood} atmosphere
- Lighting: ${bgDesc.lighting} for a ${context.mood} mood
- Industry: ${context.industry || 'general'} professional

ARTISTIC ELEMENTS:
- Modern, contemporary approach to professional portraiture
- Creative use of lighting and composition
- Innovative but appropriate styling
- Dynamic yet professional presentation

TECHNICAL EXCELLENCE:
- High resolution with artistic detail
- Professional color grading with creative flair
- Maintain facial features while enhancing presentation
- Clean, purposeful background design

BALANCE:
- Creative expression within professional boundaries
- Innovation that enhances rather than distracts
- Artistic quality that serves business purposes
- Modern approach to traditional professional portraiture

Generate a creative professional portrait that stands out while maintaining business appropriateness.`;
  }

  /**
   * Get prompt variations for different use cases
   */
  static getPromptForUseCase(
    useCase: 'linkedin' | 'business-card' | 'website' | 'presentation' | 'general',
    context: PromptContext
  ): string {
    const basePrompt = this.buildDetailedPrompt(context);
    
    const useCaseModifiers = {
      linkedin: 'Optimized for LinkedIn profile - professional, approachable, trustworthy',
      'business-card': 'Optimized for business card - clear, professional, memorable',
      website: 'Optimized for website - engaging, professional, brand-appropriate',
      presentation: 'Optimized for presentations - confident, authoritative, clear',
      general: 'General professional use - versatile, appropriate for multiple contexts',
    };

    return `${basePrompt}\n\nUSE CASE: ${useCaseModifiers[useCase]}`;
  }

  /**
   * Validate prompt context
   */
  static validateContext(context: PromptContext): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.STYLE_DESCRIPTIONS[context.style as keyof typeof this.STYLE_DESCRIPTIONS]) {
      errors.push(`Invalid style: ${context.style}`);
    }

    if (!this.BACKGROUND_DESCRIPTIONS[context.background as keyof typeof this.BACKGROUND_DESCRIPTIONS]) {
      errors.push(`Invalid background: ${context.background}`);
    }

    if (context.industry && !this.INDUSTRY_CONTEXTS[context.industry as keyof typeof this.INDUSTRY_CONTEXTS]) {
      errors.push(`Invalid industry: ${context.industry}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default PromptBuilder;
