/**
 * 编辑器状态：当前项目、撤销/重做、自动保存。
 * 所有修改都通过 update(recipe)：recipe 在项目副本上修改，自动入撤销栈并排队保存。
 */
import { create } from 'zustand';
import type { Project } from '../../shared/project/model.ts';
import type { ModuleType } from '../../shared/catalog/home.ts';
import { api, ApiError } from '../lib/api.ts';

const HISTORY_LIMIT = 100;
const SAVE_DELAY = 800;

export type SaveState = 'saved' | 'dirty' | 'saving' | 'error' | 'conflict';
export type Selection = { kind: 'page' } | { kind: 'module'; type: ModuleType };

interface EditorState {
  project: Project | null;
  past: Project[];
  future: Project[];
  saveState: SaveState;
  saveError?: string;
  serverUpdatedAt?: string;
  selection: Selection;
  toast?: { text: string; err?: boolean; id: number };
  load(id: string): Promise<void>;
  update(recipe: (draft: Project) => void | Project, opts?: { label?: string; merge?: boolean }): void;
  undo(): void;
  redo(): void;
  select(s: Selection): void;
  notify(text: string, err?: boolean): void;
  flush(): Promise<void>;
}

let saveTimer: ReturnType<typeof setTimeout> | undefined;
let lastMergeAt = 0;

export const useEditor = create<EditorState>((set, get) => ({
  project: null,
  past: [],
  future: [],
  saveState: 'saved',
  selection: { kind: 'page' },

  async load(id) {
    set({ project: null, past: [], future: [], saveState: 'saved', selection: { kind: 'page' } });
    const p = await api.getProject(id);
    set({ project: p, serverUpdatedAt: p.updatedAt });
  },

  update(recipe, opts) {
    const cur = get().project;
    if (!cur) return;
    const draft = structuredClone(cur);
    const next = (recipe(draft) as Project | void) ?? draft;
    // 连续拖动滑块/取色时合并为一步撤销
    const now = Date.now();
    const merge = opts?.merge && now - lastMergeAt < 600;
    lastMergeAt = opts?.merge ? now : 0;
    set((s) => ({
      project: next,
      past: merge ? s.past : [...s.past, cur].slice(-HISTORY_LIMIT),
      future: [],
      saveState: s.saveState === 'conflict' ? 'conflict' : 'dirty',
    }));
    scheduleSave();
  },

  undo() {
    const { past, project, future } = get();
    if (!past.length || !project) return;
    set({ project: past[past.length - 1], past: past.slice(0, -1), future: [project, ...future], saveState: 'dirty' });
    scheduleSave();
  },

  redo() {
    const { past, project, future } = get();
    if (!future.length || !project) return;
    set({ project: future[0], past: [...past, project], future: future.slice(1), saveState: 'dirty' });
    scheduleSave();
  },

  select(selection) { set({ selection }); },

  notify(text, err) {
    const id = Date.now();
    set({ toast: { text, err, id } });
    setTimeout(() => get().toast?.id === id && set({ toast: undefined }), 3200);
  },

  async flush() {
    clearTimeout(saveTimer);
    const { project, serverUpdatedAt, saveState } = get();
    if (!project || saveState === 'saved' || saveState === 'conflict') return;
    set({ saveState: 'saving' });
    try {
      const r = await api.saveProject(project, serverUpdatedAt);
      // 保存期间又有新修改时保持 dirty
      set((s) => ({ serverUpdatedAt: r.updatedAt, saveState: s.project === project ? 'saved' : 'dirty', project: s.project === project ? { ...project, updatedAt: r.updatedAt } : s.project }));
      if (get().saveState === 'dirty') scheduleSave();
    } catch (e) {
      const conflict = e instanceof ApiError && e.status === 409;
      set({ saveState: conflict ? 'conflict' : 'error', saveError: (e as Error).message });
      if (!conflict) saveTimer = setTimeout(() => get().flush(), 5000);
    }
  },
}));

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => useEditor.getState().flush(), SAVE_DELAY);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', (e) => {
    const s = useEditor.getState().saveState;
    if (s === 'dirty' || s === 'saving') e.preventDefault();
  });
}
