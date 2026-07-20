import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Item, ItemService } from '../../services/item.service';

@Component({
  selector: 'app-item-manager',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './item-manager.html',
  styleUrls: ['./item-manager.scss']
})
export class ItemManagerComponent {
  private itemService = inject(ItemService);

  // Form Signals
  title = signal('');
  category = signal('General');
  description = signal('');
  editingId = signal<number | null>(null);
  
  isAiGenerating = signal(false);

  // List of items from service
  itemList = this.itemService.getItems();

  // Trigger Gemini AI generation
  async generateDescription() {
    if (!this.title()) return;

    this.isAiGenerating.set(true);
    try {
      const aiText = await this.itemService.generateAiDescription(
        this.title(),
        this.category()
      );
      this.description.set(aiText.trim());
    } catch (e) {
      alert('Failed to generate description with Gemini.');
    } finally {
      this.isAiGenerating.set(false);
    }
  }

  // CREATE / UPDATE Handler
  saveItem() {
    if (!this.title() || !this.description()) return;

    if (this.editingId() !== null) {
      this.itemService.updateItem(this.editingId()!, {
        title: this.title(),
        category: this.category(),
        description: this.description()
      });
      this.editingId.set(null);
    } else {
      this.itemService.addItem({
        title: this.title(),
        category: this.category(),
        description: this.description()
      });
    }

    this.resetForm();
  }

  // READ for Edit
  editItem(item: Item) {
    this.editingId.set(item.id);
    this.title.set(item.title);
    this.category.set(item.category);
    this.description.set(item.description);
  }

  // DELETE Handler
  deleteItem(id: number) {
    this.itemService.deleteItem(id);
  }

  resetForm() {
    this.editingId.set(null);
    this.title.set('');
    this.category.set('General');
    this.description.set('');
  }
}