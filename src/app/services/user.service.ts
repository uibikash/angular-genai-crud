import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface User {
  id?: number | string;
  name: string;
  email: string;
  role: string;
  salary: number;
  location: string;
  dateOfJoining?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(user: Omit<User, 'id'>) {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number | string, user: Partial<User>) {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number | string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
