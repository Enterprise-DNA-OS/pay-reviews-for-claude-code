#!/usr/bin/env node
import {getDb} from './lib/db.mjs';
import {run,help,human} from './lib/reviews.mjs';
const argv=process.argv.slice(2),json=argv.includes('--json');
let db;
try{
 if(argv.length===0||argv.includes('--help'))console.log(help());
 else{
  const cmd=argv.shift(),args=[],opts={};
  for(const a of argv){if(a==='--json')continue;if(a.startsWith('--')){const at=a.indexOf('='),k=a.slice(2,at<0?undefined:at);if(k in opts)throw Error(`Duplicate flag --${k}`);opts[k]=at<0?true:a.slice(at+1);}else args.push(a);}
  db=await getDb();const result=await run(db,cmd,args,opts);console.log(json?JSON.stringify(result,null,2):human(result));
 }
}catch(e){console[json?'log':'error'](json?JSON.stringify({error:e.message}):e.message);process.exitCode=1;}finally{if(db)await db.close();}
