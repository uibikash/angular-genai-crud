import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RealtimeService } from '../../services/realtime.service';
import { User, UserService } from '../../services/user.service';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { StatusPipe } from '../../pipes/status.pipe';
import { HighlightDirective } from '../../directives/highlight.directive';
import { fadeTransition } from '../../animations/page.animation';
import { provideAnimations } from '@angular/platform-browser/animations';

interface UserForm {
  name: string;
  email: string;
  role: string;
  salary: number;
  location: string;
  dateOfJoining: string;
  isActive: boolean;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [FormsModule, TruncatePipe, DecimalPipe, StatusPipe, HighlightDirective, RouterLink, RouterLinkActive, DatePipe],
  animations: [fadeTransition],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private realtimeService = inject(RealtimeService);

  users = signal<User[]>([]);
  isSubmitting = signal(false);
  editingId = signal<number | string | null>(null);
  errorMessage = signal('');
  connectionState = signal('connecting');
  liveEvents = signal<Array<{ id: number; message: string; type: string; timestamp: string }>>([]);
  showModal = signal(false);
  activeCount = signal(0);
  totalSalary = signal(0);
  searchTerm = signal('');
  roleFilter = signal('All');
  darkMode = signal(false);
  inlineEditingId = signal<number | string | null>(null);
  inlineForm = signal<User | null>(null);
  pageSize = signal(6);
  currentPage = signal(1);
  virtualStartIndex = signal(0);
  virtualEndIndex = signal(6);
  readonly rowHeight = 64;
  selectedUserIds = signal<(number | string)[]>([]);

  form: UserForm = {
    name: '',
    email: '',
    role: 'Viewer',
    salary: 0,
    location: '',
    dateOfJoining: '',
    isActive: true
  };

  ngOnInit() {
    this.loadUsers();
    this.realtimeService.connect();

    this.realtimeService.events$.subscribe(event => {
      this.liveEvents.update(events => [event, ...events].slice(0, 5));
    });

    this.realtimeService.connectionState$.subscribe(state => {
      this.connectionState.set(state);
    });
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: users => {
        this.users.set(users);
        this.activeCount.set(users.filter(user => user.isActive).length);
        this.totalSalary.set(users.reduce((sum, user) => sum + (user.salary || 0), 0));
        this.resetPagination();
      },
      error: () => this.errorMessage.set('Unable to load users from the server.')
    });
  }

  get filteredUsers() {
    const term = this.searchTerm().toLowerCase();
    return this.users().filter(user => {
      const matchesText = !term || [user.name, user.email, user.role].join(' ').toLowerCase().includes(term);
      const matchesRole = this.roleFilter() === 'All' || user.role === this.roleFilter();
      return matchesText && matchesRole;
    });
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize()));
  }

  get pagedUsers() {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredUsers.slice(start, end);
  }

  get visibleUsers() {
    return this.pagedUsers.slice(this.virtualStartIndex(), this.virtualEndIndex());
  }

  resetPagination() {
    const nextPage = Math.min(this.currentPage(), this.totalPages);
    this.currentPage.set(nextPage);
    this.virtualStartIndex.set(0);
    this.virtualEndIndex.set(this.pageSize());
  }

  changePageSize(size: number) {
    this.pageSize.set(size);
    this.resetPagination();
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  goToPage(page: number) {
    const nextPage = Math.min(this.totalPages, Math.max(1, page));
    this.currentPage.set(nextPage);
    this.virtualStartIndex.set(0);
    this.virtualEndIndex.set(this.pageSize());
  }

  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    const containerHeight = target.clientHeight || 320;
    const scrollTop = target.scrollTop || 0;
    const overscan = 3;
    const start = Math.max(0, Math.floor(scrollTop / this.rowHeight) - overscan);
    const end = Math.min(this.pagedUsers.length, start + Math.ceil(containerHeight / this.rowHeight) + overscan * 2);

    this.virtualStartIndex.set(start);
    this.virtualEndIndex.set(end);
  }

  getBottomSpacerHeight() {
    return Math.max(0, this.pagedUsers.length - this.virtualEndIndex()) * this.rowHeight;
  }

  toggleSelectUser(id?: number | string) {
    if (id === undefined || id === null || id === '') {
      return;
    }

    this.selectedUserIds.update(selected => {
      return selected.includes(id)
        ? selected.filter(item => item !== id)
        : [...selected, id];
    });
  }

  toggleSelectAll() {
    const currentPageIds = this.visibleUsers.map(user => user.id).filter((id): id is number | string => id !== undefined && id !== null && id !== '');
    const allSelected = currentPageIds.every(id => this.selectedUserIds().includes(id));

    if (allSelected) {
      this.selectedUserIds.update(selected => selected.filter(id => !currentPageIds.includes(id)));
    } else {
      this.selectedUserIds.update(selected => Array.from(new Set([...selected, ...currentPageIds])));
    }
  }

  deleteSelectedUsers() {
    const ids = this.selectedUserIds();
    if (!ids.length) {
      return;
    }

    const confirmed = window.confirm(`Delete ${ids.length} selected user(s)?`);
    if (!confirmed) {
      return;
    }

    const requests = ids.map(id => this.userService.deleteUser(id));

    Promise.all(requests.map(request => request.toPromise())).then(() => {
      this.selectedUserIds.set([]);
      this.loadUsers();
    }).catch(() => {
      this.errorMessage.set('Unable to delete one or more selected users.');
    });
  }

  submitUser() {
    if (!this.form.name.trim() || !this.form.email.trim()) {
      this.errorMessage.set('Please fill in the name and email fields.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const payload = {
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      role: this.form.role,
      salary: this.form.salary,
      location: this.form.location.trim(),
      dateOfJoining: this.form.dateOfJoining,
      isActive: this.form.isActive
    };

    this.realtimeService.addActivity(`User ${payload.name} saved`, 'success');

    const request = this.editingId() !== null
      ? this.userService.updateUser(this.editingId()!, payload)
      : this.userService.createUser(payload);

    request.subscribe({
      next: () => {
        this.resetForm();
        this.showModal.set(false);
        this.loadUsers();
      },
      error: () => this.errorMessage.set('Could not save the user. Please try again.'),
      complete: () => this.isSubmitting.set(false)
    });
  }

  editUser(user: User) {
    this.editingId.set(user.id ?? null);
    this.form = {
      name: user.name,
      email: user.email,
      role: user.role,
      salary: user.salary,
      location: user.location || '',
      dateOfJoining: user.dateOfJoining || '',
      isActive: user.isActive
    };
    this.showModal.set(true);
  }

  toggleTheme() {
    this.darkMode.set(!this.darkMode());
  }

  deleteUser(id?: number | string) {
    if (id === undefined || id === null || id === '') {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) {
      return;
    }

    this.realtimeService.addActivity('User removed from dashboard', 'warning');
    this.userService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: () => this.errorMessage.set('Unable to delete the user.')
    });
  }

  resetForm() {
    this.editingId.set(null);
    this.form = {
      name: '',
      email: '',
      role: 'Viewer',
      salary: 0,
      location: '',
      dateOfJoining: '',
      isActive: true
    };
    this.isSubmitting.set(false);
  }

  openCreateModal() {
    this.resetForm();
    this.showModal.set(true);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
