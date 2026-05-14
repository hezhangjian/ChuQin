import {Excalidraw} from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

export function ExcalidrawTool() {
  return (
    <div className="tool-workspace excalidraw-workspace">
      <Excalidraw />
    </div>
  );
}
