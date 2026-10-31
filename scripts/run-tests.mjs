import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['--test','scripts/oneclick.test.mjs','workbench/tests/regressions.test.cjs'],{stdio:'inherit'});
process.exitCode=r.status??1;
