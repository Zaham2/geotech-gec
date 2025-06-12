import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateGeotechnicalResponse(prompt: string, context?: any): Promise<string> {
    try {
      const systemPrompt = `You are an expert geotechnical engineer AI assistant. 
      You help with soil mechanics, foundation design, slope stability, and other geotechnical engineering problems.
      Provide accurate, practical, and code-compliant solutions. Always explain your reasoning and assumptions.
      If you need more information to provide an accurate answer, ask specific questions.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: context ? `Context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}` : prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateCalculationGuidance(calculationType: string, parameters: any): Promise<string> {
    const prompt = `Help me with ${calculationType} calculation. 
    Given parameters: ${JSON.stringify(parameters)}
    Please provide step-by-step guidance, formulas, and safety considerations.`;

    return this.generateGeotechnicalResponse(prompt);
  }

  async analyzeGeotechnicalData(data: any): Promise<string> {
    const prompt = `Analyze this geotechnical data and provide insights:
    ${JSON.stringify(data)}
    
    Please provide:
    1. Data interpretation
    2. Potential issues or concerns
    3. Recommendations for further testing or analysis
    4. Design considerations`;

    return this.generateGeotechnicalResponse(prompt);
  }

  async generateReport(projectData: any, analysisResults: any): Promise<string> {
    const prompt = `Generate a professional geotechnical report summary based on:
    Project Data: ${JSON.stringify(projectData)}
    Analysis Results: ${JSON.stringify(analysisResults)}
    
    Format the response as a structured report with:
    1. Executive Summary
    2. Site Conditions
    3. Analysis Results
    4. Recommendations
    5. Limitations`;

    return this.generateGeotechnicalResponse(prompt);
  }
} 