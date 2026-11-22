/** 极简 hash 路由：#/、#/new、#/p/:id */
import { useEffect, useState } from 'react';

export type Route = { name: 'projects' } | { name: 'new' } | { name: 'editor'; id: string } | { name: 'account' };

export function parse(hash: string): Route {
  const h = hash.replace(/^#/, '') || '/';
  const m = /^\/p\/([\w-]+)/.exec(h);
  if (m) return { name: 'editor', id: m[1] };
  if (h.startsWith('/new')) return { name: 'new' };
  if (h.startsWith('/account')) return { name: 'account' };
  return { name: 'projects' };
}

export function go(path: string) { location.hash = path; }

export function useRoute(): Route {
  const [r, setR] = useState(() => parse(location.hash));
  useEffect(() => {
    const on = () => setR(parse(location.hash));
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  return r;
}
