import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { UserDashboardComponent } from './user-dashboard';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RealtimeService } from '../../services/realtime.service';

describe('UserDashboardComponent', () => {
  let fixture: ComponentFixture<UserDashboardComponent>;
  let component: UserDashboardComponent;

  const userServiceMock = {
    getUsers: vi.fn(() => of([{ id: 1, name: 'Asha', email: 'asha@example.com', role: 'Admin' }])),
    createUser: vi.fn(() => of({ id: 2, name: 'New', email: 'new@example.com', role: 'Viewer' })),
    updateUser: vi.fn(() => of({ id: 1, name: 'Asha', email: 'asha@example.com', role: 'Admin' })),
    deleteUser: vi.fn(() => of({}))
  };

  const authServiceMock = {
    isAuthenticated: signal(true),
    logout: vi.fn()
  };

  const realtimeServiceMock = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    events$: of([{ id: 1, message: 'Live connection ready', type: 'info', timestamp: 'now' }]),
    connectionState$: of('connected'),
    addActivity: vi.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: RealtimeService, useValue: realtimeServiceMock },
        { provide: Router, useValue: { navigate: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the dashboard heading and seeded user data', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('User Dashboard');
    expect(text).toContain('Asha');
    expect(text).toContain('asha@example.com');
  });

  it('shows a location field in the user form', () => {
    const formHtml = fixture.nativeElement.innerHTML;
    expect(formHtml).toContain('Location');
  });

  it('shows the location field while editing a user inline', () => {
    component.inlineEditingId.set(1);
    component.inlineForm.set({
      id: 1,
      name: 'Asha',
      email: 'asha@example.com',
      role: 'Admin',
      salary: 100000,
      location: 'Delhi',
      isActive: true
    });
    fixture.detectChanges();

    const html = fixture.nativeElement.innerHTML;
    expect(html).toContain('placeholder="Location"');
  });

  it('logs out when the logout button is clicked', () => {
    const logoutButton = fixture.nativeElement.querySelector('button.btn-outline-light');
    logoutButton.click();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
