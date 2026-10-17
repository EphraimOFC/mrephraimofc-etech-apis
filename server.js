const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const cache = new Map();
const getCache = (k) => {
  const v = cache.get(k);
  if(!v) return null;
  if(Date.now() - v.time > 1000*60*60*6) { cache.delete(k); return null; }
  return v.data;
}
const setCache = (k,d) => { cache.set(k, {data:d, time: Date.now()}); if(cache.size>200) cache.delete(cache.keys().next().value); }

async function fastYtmp3(url){
  const key = `mp3:${url}`;
  const cached = getCache(key);
  if(cached) return cached;
  
  try {
    const { ytmp3 } = require('btch-downloader');
    const data = await ytmp3(url);
    setCache(key,data);
    return data;
  } catch(e) {
    console.log('ytmp3 fail', e.message);
    throw new Error("ytmp3 engine failed: " + e.message);
  }
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

app.get('/', (req,res)=>{
  res.send(`<html><head><title>mrephraimofc-etech-apis - FAST & FREE</title><meta name="viewport" content="width=device-width">
  <style>body{background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:20px}
  .b{border:1px solid #222;background:#0a0a0a;border-radius:12px;padding:15px;margin:10px auto;max-width:650px}
  h1{color:#00ff88} code{background:#111;padding:6px;border-radius:6px;display:block;margin:8px 0}
  .fast{color:#00ff88;font-weight:bold}</style></head>
  <body><h1>⚡ mrephraimofc-etech-apis</h1>
  <p class="fast">SUPER FAST • FREE FOREVER • UNLIMITED</p><p>By Mr Ephraim Ofc - E TECH OFC™</p>
  <p>Cache = INSTANT ⚡</p>
  <div class="b"><h3>🎵 /api/song?url=</h3><code>YT mp3 - Fast 2-4 sec</code></div>
  <div class="b"><h3>🎬 /api/video?url=</h3><code>YT mp4</code></div>
  <div class="b"><h3>📘 /api/fb?url=</h3><code>Facebook</code></div>
  <div class="b"><h3>💃 /api/tiktok?url=</h3><code>TikTok</code></div>
  <div class="b"><h3>📸 /api/ig?url=</h3><code>Instagram</code></div>
  </body></html>`)
});

app.get('/api/song', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url=YOUTUBE_URL"});
  try{ 
    const start = Date.now();
    const data = await fastYtmp3(req.query.url);
    // Return FLAT for bot + nested for compatibility
    res.json({ creator:"mrephraimofc-etech-apis", speed:`${Date.now()-start}ms`, status:true, url: data.mp3 || data.url, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});

app.get('/api/video', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{
    const start = Date.now();
    const data = await fastYtmp4(req.query.url);
    res.json({ creator:"mrephraimofc-etech-apis", speed:`${Date.now()-start}ms`, status:true, url: data.mp4 || data.video || data.url, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});

app.get('/api/fb', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{ const { fbdown } = require('btch-downloader'); const d = await fbdown(req.query.url); res.json({creator:"mrephraimofc", status:true, url: d.HD || d.SD || d.url, result:d}); }catch(e){ res.json({status:false, error:e.message}) }
});
app.get('/api/tiktok', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{ const { tiktok } = require('btch-downloader'); const d = await tiktok(req.query.url); res.json({creator:"mrephraimofc", status:true, url: d.video || d.mp4 || d.url, result:d}); }catch(e){ res.json({status:false, error:e.message}) }
});
app.get('/api/ig', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{ const { igdl } = require('btch-downloader'); const d = await igdl(req.query.url); res.json({creator:"mrephraimofc", status:true, url: d.url || d.data?.[0]?.url, result:d}); }catch(e){ res.json({status:false, error:e.message}) }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`⚡ mrephraimofc-etech-apis FAST API running ${PORT}`));
