import {useEffect} from 'react';
import {getBuiltInTool, type BuiltInToolId} from '../../lib/tools';
import {ExcalidrawTool} from './ExcalidrawTool';
import {HexCodecTool} from './HexCodecTool';
import {JsonFormatTool} from './JsonFormatTool';
import {Md5Tool} from './Md5Tool';
import {TimestampTool} from './TimestampTool';
import {UrlCodecTool} from './UrlCodecTool';

type ToolWorkspaceProps = {
  toolId: string;
};

function renderTool(toolId: BuiltInToolId) {
  if (toolId === 'excalidraw') {
    return <ExcalidrawTool />;
  }

  if (toolId === 'json-format') {
    return <JsonFormatTool />;
  }

  if (toolId === 'md5') {
    return <Md5Tool />;
  }

  if (toolId === 'url-codec') {
    return <UrlCodecTool />;
  }

  if (toolId === 'hex-codec') {
    return <HexCodecTool />;
  }

  return <TimestampTool />;
}

export function ToolWorkspace({toolId}: ToolWorkspaceProps) {
  const tool = getBuiltInTool(toolId);

  useEffect(() => {
    document.documentElement.style.setProperty('--lg-button-border-radius', '6px');
  }, []);

  if (!tool) {
    return (
      <div className="main-area-state error">
        <strong>Unknown tool</strong>
      </div>
    );
  }

  return renderTool(tool.id);
}
