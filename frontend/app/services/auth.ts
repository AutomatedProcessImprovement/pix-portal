export interface User {
  email: string;
  token?: string;
  first_name: string;
  last_name: string;
  creation_time: string;
  modification_time: string;
  deletion_time: string;
  last_login_time: string;
  id: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
}
