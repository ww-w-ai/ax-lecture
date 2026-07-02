const { chromium } = require('./_pw');
(async()=>{const b=await chromium.connectOverCDP('http://localhost:9333');const ctx=b.contexts()[0];let p=null;for(const pg of ctx.pages()){if(pg.url().includes('deck.html'))p=pg;}await p.bringToFront();await p.screenshot({path:'html/_deck-live.png'});console.log('shot');process.exit(0);})().catch(e=>{console.log('ERR',e.message);process.exit(1);});
