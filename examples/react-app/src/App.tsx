import {
  useState,
  useCallback,
} from 'react';

import {
  useDevbook,
  Env,
  DevbookStatus,
} from '@devbookhq/sdk';
import { Editor, Output } from '@devbookhq/ui'

import './App.css';

const initialCode = `const os = require('os');
console.log('Hostname:', os.hostname());
console.log(process.env)`

const initialCmd =
  `ls -l
`

function App() {
  const [code, setCode] = useState(initialCode);
  const [cmd, setCmd] = useState(initialCmd);
  const [execType, setExecType] = useState('code');

  const { stderr, stdout, runCode, runCmd, status } = {
    stderr: [],
    stdout: [],
    runCode: (str: string) => { },
    runCmd: (str: string) => { },
    status: DevbookStatus.Disconnected,
  };
  // const { stderr, stdout, runCode, runCmd, status } = useDevbook({ debug: true, env: Env.NodeJS });
  console.log({ stdout, stderr })



  const handleEditorChange = useCallback((content: string) => {
    if (execType === 'code') {
      setCode(content);
    } else {
      setCmd(content);
    }
  }, [setCode, execType]);

  const run = useCallback(() => {
    if (execType === 'code') {
      runCode(code);
    } else {
      runCmd(cmd);
    }
  }, [runCode, runCmd, code, cmd, execType]);


  return (
    <div className="app">
      {status === DevbookStatus.Disconnected && <div>Status: Disconnected, will start VM</div>}
      {status === DevbookStatus.Connecting && <div>Status: Starting VM...</div>}
      {status === DevbookStatus.Connected && (
        <div className="controls">
          <select className="type" value={execType} onChange={e => setExecType(e.target.value)}>
            <option value="code">Code</option>
            <option value="cmd">Command</option>
          </select>
          <button className="run-btn" onClick={run}>Run</button>
        </div>
      )}
      <Editor
        filepath="index.js"
        initialCode={execType === 'code' ? initialCode : initialCmd}
        onChange={handleEditorChange}
      />
      <Output
        stdout={stdout}
        stderr={stderr}
      />
    </div >
  );
}

export default App;
