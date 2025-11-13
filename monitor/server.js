const express = require('express');
const http = require('http');
const fs = require('fs');
const pm2 = require('pm2');
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {cors:{origin:"*"}});

const PORT = process.env.MONITOR_PORT || 9092;
const NGROK_FILE = process.env.NGROK_FILE || (process.env.HOME + '/siraj/url.txt');

app.use(express.static(__dirname + '/public'));

io.on('connection', socket=>{
  // إرسال فورية ثم تحديث دوري
  const send = ()=> {
    pm2.connect(err=>{
      if(err){ socket.emit('error','pm2 connect failed'); return; }
      pm2.list((err,list)=>{
        pm2.disconnect();
        if(err){ socket.emit('error','pm2 list failed'); return; }
        const data = list.map(p=>({
          id: p.pm_id,
          name: p.name,
          status: p.pm2_env && p.pm2_env.status || '',
          cpu: p.monit && (p.monit.cpu||0),
          memory_mb: p.monit && Math.round((p.monit.memory||0)/1024/1024),
          restarts: p.pm2_env && (p.pm2_env.restart_time||0),
          uptime_ms: p.pm2_env && (p.pm2_env.pm_uptime||0)
        }));
        // read ngrok url if exists
        let ngrok = '';
        try{ ngrok = fs.readFileSync(NGROK_FILE,'utf8').trim(); }catch(e){}
        socket.emit('status',{procs:data,ngrok});
      });
    });
  };
  send();
  const t = setInterval(send,3000);

  // subscribe to pm2 bus for live logs (best-effort)
  pm2.connect(err=>{
    if(err) return;
    pm2.launchBus((err,bus)=>{
      if(err) { pm2.disconnect(); return; }
      const tailLog = (packet)=>{
        if(packet && packet.data){
          socket.emit('log',{name: packet.process ? packet.process.name : 'pm2', data: packet.data});
        }
      };
      bus.on('log:out', tailLog);
      bus.on('log:err', tailLog);
      socket.on('disconnect', ()=> { bus.removeListener('log:out', tailLog); bus.removeListener('log:err', tailLog); pm2.disconnect(); });
    });
  });

  socket.on('restart', name=>{
    pm2.connect(err=>{
      if(err) return socket.emit('action','pm2 connect failed');
      pm2.restart(name,(err)=>{ pm2.disconnect(); socket.emit('action', err ? ('error:'+err.message) : 'ok'); });
    });
  });
  socket.on('disconnect', ()=> clearInterval(t));
});

server.listen(PORT,()=> console.log('Monitor running on',PORT));
