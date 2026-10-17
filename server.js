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
  const { default: ytdl } = await import('@distube/ytdl-core');
  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });
  const data = { title: info.videoDetails.title, url: format.url, mp3: format.url };
  setCache(key, data);
  return data;
}

async function fastYtmp4(url){
  const key = `mp4:${url}`;
  const cached = getCache(key);
  if(cached) return cached;
  const { default: ytdl } = await import('@distube/ytdl-core');
  const info = await ytdl.getInfo(url);
  const format = ytdl.chooseFormat(info.formats, { filter: 'videoandaudio', quality: 'highest' });
  const data = { title: info.videoDetails.title, url: format.url, mp4: format.url };
  setCache(key, data);
  return data;
}

app.get('/', (req,res)=>{
  res.send(`<html><head><title>mrephraimofc-etech-apis</title><meta name="viewport" content="width=device-width">
  <style>body{background:#000;color:#fff;font-family:sans-serif;text-align:center;padding:20px}
  .b{border:1px solid #222;background:#0a0a0a;border-radius:12px;padding:15px;margin:10px auto;max-width:650px}
  h1{color:#00ff88}</style></head>
  <body><h1>⚡ mrephraimofc-etech-apis - FIXED</h1><p>By Mr Ephraim Ofc - E TECH OFC™</p><p>Cache = INSTANT ⚡</p>
  <div class="b">🎵 /api/song?url=</div><div class="b">🎬 /api/video?url=</div><div class="b">📘 /api/fb?url=</div></body></html>`)
});

app.get('/api/song', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{ 
    const start = Date.now();
    const data = await fastYtmp3(req.query.url);
    res.json({ creator:"mrephraimofc-etech-apis", speed:`${Date.now()-start}ms`, status:true, url: data.url, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});

app.get('/api/video', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{
    const start = Date.now();
    const data = await fastYtmp4(req.query.url);
    res.json({ creator:"mrephraimofc-etech-apis", speed:`${Date.now()-start}ms`, status:true, url: data.url, result:data });
  }catch(e){ res.json({status:false, error:e.message}) }
});

app.get('/api/fb', async (req,res)=>{
  if(!req.query.url) return res.json({status:false, error:"Add ?url="});
  try{ 
    const { fbdown } = require('btch-downloader');
    const d = await fbdown(req.query.url); 
    res.json({creator:"mrephraimofc", status:true, url: d.HD || d.SD || d.url, result:d}); 
  }catch(e){ 
    res.json({status:false, error:e.message}) 
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`⚡ FIXED API running ${PORT}`));
