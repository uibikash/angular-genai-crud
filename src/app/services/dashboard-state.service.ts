import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  readonly selectedUsers = signal<(number | string)[]>([]);
  readonly sidebarOpen = signal(false);

  toggleUserSelection(id: number | string) {
    this.selectedUsers.update(selected =>
      selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]
    );
  }

  clearSelection() {
    this.selectedUsers.set([]);
  }
}
