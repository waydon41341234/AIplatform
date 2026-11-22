import { useRoute } from './lib/router.ts';
import { Icon } from './components/ui.tsx';
import { ProjectsPage } from './pages/Projects.tsx';
import { NewProjectPage } from './pages/NewProject.tsx';
import { EditorPage } from './pages/Editor.tsx';
import { AccountPage } from './pages/Account.tsx';

export function App() {
  const r = useRoute();
  if (r.name === 'editor') return <EditorPage id={r.id} />;
  return (
    <div className="shell">
      <nav className="rail" aria-label="主导航">
        <img className="rail-logo" src="/brand/logo-orb.webp" alt="定制设计" />
        <a href="#/" className={r.name === 'projects' ? 'active' : ''}><Icon name="folder" />项目</a>
        <a href="#/new" className={r.name === 'new' ? 'active' : ''}><Icon name="plus" />新建</a>
        <a href="#/account" className={r.name === 'account' ? 'active' : ''}><Icon name="wallet" />余额</a>
      </nav>
      <main className="main">
        {r.name === 'projects' && <ProjectsPage />}
        {r.name === 'new' && <NewProjectPage />}
        {r.name === 'account' && <AccountPage />}
      </main>
    </div>
  );
}
