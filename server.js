const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// CACHE for speed - second time = instant
const cache = new Map();
const getCache = (k) => {
  const v = cache.get(k);
  if(!v) return null;
  if(Date.now() - v.time > 1000*60*60*6) { cache.delete(k); return null; } // 6h expiry
  return v.data;
}
const setCache = (k,d) => { cache.set(k, {data:d, time: Date.now()}); if(cache.size>200) cache.delete(cache.keys().next().value); }

// FAST YT DOWNLOADER WITH FALLBACKS
async function fastYtmp3(url){
  const key = `mp3:${url}`;
  const cached = getCache(key);
  if(cached) return cached;
  
  // Try 3 engines for speed, fastest first
  const engines = [
    async () => { const { ytmp3 } = require('btch-downloader'); return await ytmp3(url); },
    async () => { const { default: ytdl } = await import('@distube/ytdl-core'); 
      const info = await ytdl.getInfo(url); 
      const f = ytdl.chooseFormat(info.formats, {filter:'audioonly', quality:'highestaudio'});
      return { title: info.videoDetails.title, mp3: f.url, url: f.url }; 
    },
    async () => { 
      const res = await fetch(`https://api.vevioz.com/api/button/mp3/${encodeURIComponent(url)}`).then(r=>r.json()).catch(()=>null);
      return res;
    }
  ];
  
  for(let eng of engines){
    try{ const data = await eng(); if(data){ setCache(key,data); return data; } }catch(e){}
  }
  throw new Error("All engines failed");
}

async function fastYtmp4(url){
  const key = `mp4:${url}`;
  const cached = getCache(key);
  if(cached) return cached;
  const { ytmp4 } = require('btch-downloader');
  const data = await ytmp4(url);
  setCache(key,data);
  return data;
}

// HOME PAGE
app.get('/', (req,res)=>{
  res.send(`
  <html><head><title>mrephraimofc-etech-apis - FAST & FREE</title>
  <meta name="viewport" content="width=device-width">
  <style>body{background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:20px}
  .b{border:1px solid #222;background:#0a0a0a;border-radius:12px;padding:15px;margin:10px auto;max-width:650px}
  h1{color:#00ff88} code{background:#111;padding:6px;border-radius:6px;display:block;margin:8px 0}
  .fast{color:#00ff88;font-weight:bold}</style></head>
  <body>
  <h1>⚡ mrephraimofc-etech-apis</h1>
  <p class="fast">SUPER FAST • FREE FOREVER • UNLIMITED</p>
  <p>By Mr Ephraim Ofc - E TECH OFC™</p>
  <p>Cache Enabled = Second download = INSTANT ⚡</p>
  <div class="b"><h3>🎵 /api/song?url=</h3><code>YT mp3 - Fast 2-4 sec</code></div>
  <div class="b"><h3>🎬 /api/video?url=</h3><code>YT mp4 360/480/720p</code></div>
  <div class="b"><h3>📘 /api/fb?url=</h3><code>Facebook HD/SD</code></div>
  <div class="b"><h3>💃 /api/tiktok?url=</h3><code>TikTok No Watermark</code></div>
  <div class="b"><h3>📸 /api/ig?url=</h3><code>Instagram Reels/Photos</code></div>
  <div class="b"><h3>🔧 How to add more?</h3><code>Just add new app.get('/api/YOURNAME') in server.js</code></div>
  <p>✅ Free Forever - Host on Render + UptimeRobot (never sleeps)</p>
  </body></html>`)
});

// ENDPOINTS - ALL FAST + CACHED
app.get('/api/song', async (req,res)=>{
  try{ 
    const start = Date.now();
    const data = await fastYtmp3(req.query.url);
    res.json({ creator:"mrephraimofc-etech-apis", speed:`${Date.now()-start}ms`, status:true, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});

app.get('/api/video', async (req,res)=>{
  try{
    const start = Date.now();
    const data = await fastYtmp4(req.query.url);
    res.json({ creator:"mrephraimofc-etech-apis", speed:`${Date.now()-start}ms`, status:true, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});

app.get('/api/fb', async (req,res)=>{
  try{ const { fbdown } = require('btch-downloader'); const d = await fbdown(req.query.url); res.json({creator:"mrephraimofc", status:true, result:d}); }catch(e){ res.json({status:false, error:e.message}) }
});
app.get('/api/tiktok', async (req,res)=>{
  try{ const { ttdown } = require('btch-downloader'); const d = await ttdown(req.query.url); res.json({creator:"mrephraimofc", status:true, result:d}); }catch(e){ res.json({status:false, error:e.message}) }
});
app.get('/api/ig', async (req,res)=>{
  try{ const { igdl } = require('btch-downloader'); const d = await igdl(req.query.url); res.json({creator:"mrephraimofc", status:true, result:d}); }catch(e){ res.json({status:false, error:e.message}) }
});

// === HOW TO ADD NEW API LATER - EXAMPLE TEMPLATE ===
/*
// Just copy-paste this to add new one e.g Twitter, Spotify etc
app.get('/api/twitter', async (req,res)=>{
  try{
    const { twitter } = require('btch-downloader'); // or your scraper
    const data = await twitter(req.query.url);
    res.json({ creator:"mrephraimofc", status:true, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});
*/

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`⚡ mrephraimofc-etech-apis FAST API running ${PORT}`));
