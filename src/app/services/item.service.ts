import { Injectable, signal } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../environments/environments';

export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private genAI = new GoogleGenerativeAI(environment.geminiApiKey);
 private model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  items = signal<Item[]>([
    { id: 1, title: 'Angular Setup', description: 'Initial project boilerplate.', category: 'Development' }
  ]);

  getItems() {
    return this.items;
  }

  addItem(newItem: Omit<Item, 'id'>) {
    const item: Item = { id: Date.now(), ...newItem };
    this.items.update(list => [...list, item]);
  }

  updateItem(id: number, updated: Partial<Item>) {
    this.items.update(list =>
      list.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
  }

  deleteItem(id: number) {
    this.items.update(list => list.filter(item => item.id !== id));
  }

  async generateAiDescription(title: string, category: string): Promise<string> {
    const prompt = `Provide a concise, professional description (20-30 words) for a CRUD item titled "${title}" under the category "${category}".`;
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }
}