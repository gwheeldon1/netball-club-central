// Temporary compatibility stub for remaining imports
// All functionality now handled by unified API

export const supabaseChildrenApi = {
  getAll: () => Promise.resolve([]),
  getById: () => Promise.resolve(undefined),
  getByTeamId: () => Promise.resolve([]),
  getByParentId: () => Promise.resolve([]),
  create: () => Promise.resolve({} as any),
  update: () => Promise.resolve(undefined),
};

export const supabaseTeamApi = {
  getAll: () => Promise.resolve([]),
  getById: () => Promise.resolve(undefined),
  create: () => Promise.resolve({} as any),
  update: () => Promise.resolve(undefined),
  delete: () => Promise.resolve(),
};

export const supabaseUserApi = {
  getAll: () => Promise.resolve([]),
  getById: () => Promise.resolve(undefined),
  getByEmail: () => Promise.resolve(undefined),
  getCurrentUser: () => Promise.resolve(undefined),
  create: () => Promise.resolve({} as any),
  update: () => Promise.resolve(undefined),
  delete: () => Promise.resolve(),
};

export const supabaseRoleApi = {
  assignRole: () => Promise.resolve(),
  removeRole: () => Promise.resolve(),
  getUserRoles: () => Promise.resolve([]),
  hasRole: () => Promise.resolve(false),
};