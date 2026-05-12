import { MainArea } from "./components/main-area/MainArea";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ToolPanel } from "./components/tools/ToolPanel";
import { useAppLayout } from "./hooks/useAppLayout";
import "./App.css";

function App() {
  const appLayout = useAppLayout();

  return (
    <main className="app-layout" style={appLayout.rootStyle}>
      <header className="app-titlebar">
        <div className="titlebar-actions left">
          <button
            aria-label={appLayout.isLeftCollapsed ? "Show file explorer" : "Hide file explorer"}
            className="titlebar-toggle"
            onClick={appLayout.toggleLeftCollapsed}
            type="button"
          >
            <span className="sidebar-toggle-icon left" aria-hidden="true" />
          </button>
        </div>

        <div className="titlebar-actions right">
          <button
            aria-label={appLayout.isRightCollapsed ? "Show tool panel" : "Hide tool panel"}
            className="titlebar-toggle"
            onClick={appLayout.toggleRightCollapsed}
            type="button"
          >
            <span className="sidebar-toggle-icon right" aria-hidden="true" />
          </button>
        </div>
      </header>

      {appLayout.isLeftCollapsed ? null : <Sidebar />}
      <MainArea />
      {appLayout.isRightCollapsed ? null : <ToolPanel />}
    </main>
  );
}

export default App;
