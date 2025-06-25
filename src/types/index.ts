// src/types/index.ts
export interface AdminUser {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'super_admin' | 'content_manager'
  is_active: boolean
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface NavItem {
  title: string
  href: string
  icon?: string
  children?: NavItem[]
}

export interface SidebarNavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  children?: SidebarNavItem[]
}

export interface Destination {
  id: string
  name: string
  slug: string
  country: string
  region: string | null
  description: string | null
  hero_image: string | null
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}