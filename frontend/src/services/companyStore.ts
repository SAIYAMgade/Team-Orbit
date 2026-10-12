/**
 * Company & Member Management Service
 * Supports:
 * 1. Demo Mode (Acet Labs with full 8-person engineering team)
 * 2. Real Clean Company Mode (Created by Admin, members join via invite link)
 * 3. Real-time storage broadcasting across tabs and windows
 * 4. Invite link URL payload syncing across browser sessions
 */

export interface CompanyMember {
  id: string;
  name: string;
  role: 'Developer' | 'Admin' | 'Designer' | 'Product Manager' | 'DevOps' | 'QA';
  email: string;
  joinedAt: string;
  avatar?: string;
  status: 'active' | 'inactive';
  isOnline: boolean;
  assignedTask?: string;
}

export interface Company {
  id: string;
  name: string;
  adminName: string;
  adminEmail: string;
  description?: string;
  createdAt: string;
  inviteToken: string;
  status: 'active' | 'inactive';
  members: CompanyMember[];
  isDemo?: boolean;
}

const STORAGE_KEY = 'orbitra_companies_store';
const CURRENT_COMPANY_KEY = 'orbitra_active_company_id';

// Default Demo Company: Acet Labs with complete 8-person team
export const demoCompany: Company = {
  id: 'comp-demo-acet',
  name: 'Acet Labs',
  adminName: 'David K.',
  adminEmail: 'david@acetlabs.io',
  description: 'Distributed infrastructure virtualization & collaborative workspace',
  createdAt: '2026-09-28T10:30:00Z',
  inviteToken: 'acet-token-8842',
  status: 'active',
  isDemo: true,
  members: [
    {
      id: 'm-david',
      name: 'David K.',
      role: 'Admin',
      email: 'david@acetlabs.io',
      joinedAt: '2026-09-28',
      status: 'active',
      isOnline: true,
      assignedTask: 'Platform Architecture & Access Governance'
    },
    {
      id: 'm-priya',
      name: 'Priya Sharma',
      role: 'Developer',
      email: 'priya@acetlabs.io',
      joinedAt: '2026-10-01',
      status: 'active',
      isOnline: true,
      assignedTask: 'Real-time WebSocket Sync & Multi-cursor engine'
    },
    {
      id: 'm-julian',
      name: 'Julian Vance',
      role: 'Developer',
      email: 'julian@acetlabs.io',
      joinedAt: '2026-10-03',
      status: 'active',
      isOnline: true,
      assignedTask: 'Cluster Telemetry & Service Metrics'
    },
    {
      id: 'm-sarah',
      name: 'Sarah Lin',
      role: 'Developer',
      email: 'sarah@acetlabs.io',
      joinedAt: '2026-10-04',
      status: 'active',
      isOnline: true,
      assignedTask: 'Frontend Architecture & Cyber Matrix UI'
    },
    {
      id: 'm-marcus',
      name: 'Marcus Brody',
      role: 'DevOps',
      email: 'marcus@acetlabs.io',
      joinedAt: '2026-10-05',
      status: 'active',
      isOnline: true,
      assignedTask: 'Kubernetes Cluster Isolation & Multi-tenancy'
    },
    {
      id: 'm-elena',
      name: 'Elena Rostova',
      role: 'QA',
      email: 'elena@acetlabs.io',
      joinedAt: '2026-10-06',
      status: 'active',
      isOnline: false,
      assignedTask: 'Automated E2E Test Suite & Regression'
    },
    {
      id: 'm-chen',
      name: 'Chen Wei',
      role: 'Developer',
      email: 'chen@acetlabs.io',
      joinedAt: '2026-10-07',
      status: 'active',
      isOnline: true,
      assignedTask: 'High-Throughput gRPC & API Gateway'
    },
    {
      id: 'm-alex',
      name: 'Alex Morgan',
      role: 'Product Manager',
      email: 'alex@acetlabs.io',
      joinedAt: '2026-10-08',
      status: 'active',
      isOnline: true,
      assignedTask: 'Sprint Backlog & Deliverable Tracking'
    }
  ]
};

export const companyStore = {
  getCompanies(): Company[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: Company[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch {
        list = [];
      }
    }

    if (list.length === 0) {
      list = [demoCompany];
    }

    // Clean up any stale legacy companies named "Orbitra Technologies"
    let modified = false;
    list = list.map(c => {
      if (c.name.includes('Orbitra Technologies')) {
        modified = true;
        return { ...c, name: 'Acet Labs' };
      }
      return c;
    });

    // Ensure Acet Labs has the full 8-person team if it's the demo company
    const acet = list.find(c => c.name === 'Acet Labs' || c.id === demoCompany.id);
    if (acet && acet.members.length < demoCompany.members.length) {
      acet.members = [...demoCompany.members];
      modified = true;
    }

    // Ensure currently logged-in user is present in the active company's members list
    const currentUserRaw = localStorage.getItem('orbitra_current_user');
    if (currentUserRaw) {
      try {
        const currentUser = JSON.parse(currentUserRaw);
        if (currentUser.email) {
          const activeId = localStorage.getItem(CURRENT_COMPANY_KEY) || (list[0] ? list[0].id : '');
          const targetCompany = list.find(c => c.id === activeId) || list[0];
          if (targetCompany) {
            const hasUser = targetCompany.members.some(
              m => m.email.toLowerCase() === currentUser.email.toLowerCase()
            );
            if (!hasUser) {
              targetCompany.members.unshift({
                id: `usr-${Date.now()}`,
                name: currentUser.name || currentUser.email.split('@')[0],
                role: currentUser.role || 'Admin',
                email: currentUser.email,
                joinedAt: new Date().toISOString().split('T')[0],
                status: 'active',
                isOnline: true,
                assignedTask: currentUser.role === 'Admin' ? 'Workspace Governance' : 'Sprint Delivery'
              });
              modified = true;
            }
          }
        }
      } catch {
        // ignore
      }
    }

    if (modified) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    return list;
  },

  saveCompanies(companies: Company[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
    window.dispatchEvent(new Event('orbitra_store_updated'));
  },

  getCompanyById(id: string): Company | undefined {
    return this.getCompanies().find(c => c.id === id);
  },

  /**
   * Resilient token resolution:
   * Finds company by token, falls back to active company or latest company
   */
  getCompanyByToken(token?: string): Company | undefined {
    const all = this.getCompanies();
    if (token) {
      const found = all.find(c => c.inviteToken === token);
      if (found) return found;
    }
    return this.getActiveCompany() || all[0];
  },

  getActiveCompany(): Company | null {
    const activeId = localStorage.getItem(CURRENT_COMPANY_KEY);
    const all = this.getCompanies();
    if (!activeId) {
      return all.length > 0 ? all[0] : null;
    }
    const found = all.find(c => c.id === activeId);
    return found || all[0] || null;
  },

  setActiveCompany(id: string): void {
    localStorage.setItem(CURRENT_COMPANY_KEY, id);
    window.dispatchEvent(new Event('orbitra_store_updated'));
  },

  /**
   * Set Demo Mode: Loads Acet Labs with David, Priya, Julian, Sarah, Marcus, etc.
   */
  loadDemoMode(): Company {
    const companies = this.getCompanies();
    let demo = companies.find(c => c.id === demoCompany.id || c.name === 'Acet Labs');
    if (!demo) {
      demo = { ...demoCompany };
      companies.unshift(demo);
    } else {
      demo.members = [...demoCompany.members];
    }
    this.saveCompanies(companies);
    this.setActiveCompany(demo.id);

    localStorage.setItem('access_token', 'demo-token-' + Date.now());
    localStorage.setItem('orbitra_auth_email', demo.adminEmail);
    localStorage.setItem('orbitra_current_user', JSON.stringify({
      name: demo.adminName,
      email: demo.adminEmail,
      role: 'Admin',
      companyId: demo.id,
      companyName: demo.name,
      isDemo: true
    }));
    return demo;
  },

  /**
   * Create fresh company for Admin.
   * Only the Admin who created the company exists initially.
   */
  ensureCompanyForAdmin(companyName: string, adminEmail: string, adminName?: string): Company {
    const companies = this.getCompanies();
    const cleanName = companyName.trim();
    let company = companies.find(
      c => !c.isDemo && c.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (!company) {
      const newId = `comp-${Date.now()}`;
      const token = `inv-${Math.random().toString(36).substring(2, 8)}`;
      const resolvedAdminName = adminName?.trim() || adminEmail.split('@')[0] || 'Admin';

      company = {
        id: newId,
        name: cleanName,
        adminName: resolvedAdminName,
        adminEmail: adminEmail,
        description: `${cleanName} enterprise workspace`,
        createdAt: new Date().toISOString(),
        inviteToken: token,
        status: 'active',
        isDemo: false,
        members: [
          {
            id: `admin-${Date.now()}`,
            name: resolvedAdminName,
            role: 'Admin',
            email: adminEmail,
            joinedAt: new Date().toISOString().split('T')[0],
            status: 'active',
            isOnline: true,
            assignedTask: 'Workspace Administration & Team Management'
          }
        ]
      };
      companies.unshift(company);
      this.saveCompanies(companies);
    }

    this.setActiveCompany(company.id);
    return company;
  },

  /**
   * Cross-browser invite sync: ensures company exists from URL invite parameters
   */
  ensureCompanyFromInvite(companyName: string, inviteToken?: string, adminName?: string): Company {
    const cleanName = companyName.trim();
    const companies = this.getCompanies();
    let company = companies.find(
      c => c.name.toLowerCase() === cleanName.toLowerCase() || (inviteToken && c.inviteToken === inviteToken)
    );

    if (!company) {
      const newId = `comp-${Date.now()}`;
      const token = inviteToken || `inv-${Math.random().toString(36).substring(2, 8)}`;
      const resolvedAdmin = adminName?.trim() || 'Workspace Admin';

      company = {
        id: newId,
        name: cleanName,
        adminName: resolvedAdmin,
        adminEmail: 'admin@' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.io',
        description: `${cleanName} enterprise workspace`,
        createdAt: new Date().toISOString(),
        inviteToken: token,
        status: 'active',
        isDemo: false,
        members: [
          {
            id: `admin-${Date.now()}`,
            name: resolvedAdmin,
            role: 'Admin',
            email: 'admin@' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.io',
            joinedAt: new Date().toISOString().split('T')[0],
            status: 'active',
            isOnline: true,
            assignedTask: 'Workspace Administration'
          }
        ]
      };
      companies.unshift(company);
      this.saveCompanies(companies);
    }

    this.setActiveCompany(company.id);
    return company;
  },

  /**
   * Adds real member via invite link
   */
  addMemberViaToken(
    token: string,
    member: { name: string; email: string; role?: CompanyMember['role']; assignedTask?: string }
  ): { success: boolean; company?: Company; error?: string; member?: CompanyMember } {
    const companies = this.getCompanies();
    let company = companies.find(c => c.inviteToken === token);

    if (!company) {
      company = this.getActiveCompany() || companies[0];
    }

    if (!company) {
      return { success: false, error: 'Workspace not found' };
    }

    const existingIndex = company.members.findIndex(
      m => m.email.toLowerCase() === member.email.toLowerCase()
    );

    let newMember: CompanyMember;

    if (existingIndex >= 0) {
      newMember = {
        ...company.members[existingIndex],
        name: member.name,
        isOnline: true,
        status: 'active',
        assignedTask: member.assignedTask || company.members[existingIndex].assignedTask || 'Active Team Contributor'
      };
      company.members[existingIndex] = newMember;
    } else {
      newMember = {
        id: `dev-${Date.now()}`,
        name: member.name,
        role: member.role || 'Developer',
        email: member.email,
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'active',
        isOnline: true,
        assignedTask: member.assignedTask || 'Feature Engineering & Sprint Delivery'
      };
      company.members.push(newMember);
    }

    this.saveCompanies(companies);
    this.setActiveCompany(company.id);

    // Store joined member profile and auth session
    localStorage.setItem('access_token', 'member-token-' + Date.now());
    localStorage.setItem('orbitra_auth_email', newMember.email);
    localStorage.setItem('orbitra_current_user', JSON.stringify({
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      companyId: company.id,
      companyName: company.name
    }));

    return { success: true, company, member: newMember };
  },

  toggleMemberStatus(companyId: string, memberId: string): Company | null {
    const companies = this.getCompanies();
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return null;

    const member = comp.members.find(m => m.id === memberId);
    if (member) {
      member.status = member.status === 'active' ? 'inactive' : 'active';
      this.saveCompanies(companies);
    }
    return comp;
  },

  toggleMemberPresence(companyId: string, memberId: string): Company | null {
    const companies = this.getCompanies();
    const comp = companies.find(c => c.id === companyId);
    if (!comp) return null;

    const member = comp.members.find(m => m.id === memberId);
    if (member) {
      member.isOnline = !member.isOnline;
      this.saveCompanies(companies);
    }
    return comp;
  },

  getInviteUrl(company: Company): string {
    const query = new URLSearchParams({
      token: company.inviteToken,
      workspace: company.name,
      admin: company.adminName
    }).toString();
    return `${window.location.origin}/join?${query}`;
  }
};
