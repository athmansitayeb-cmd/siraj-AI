const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const pm2 = require('pm2');
const PORT = 9091;

app.use(express.static('public'));

const STATUS_COLORS = { online: '🟢', stopped: '🔴', errored: '🟡' };

io.on('connection', socket => {
  console.log('⚡ مستخدم متصل باللوحة');

  const sendStatus = () => {
    pm2.connect(err => {
      if (err) { console.error(err); return; }
      pm2.list((err, list) => {
        pm2.disconnect();
        if (err) { console.error(err); return; }
        const data = list.map(p => ({
          id: p.pm_id,
          name: p.name,
          status: p.pm2_env.status,
          color: STATUS_COLORS[p.pm2_env.status] || '⚪',
          cpu: p.monit && p.monit.cpu ? p.monit.cpu : 0,
          memory: p.monit && p.monit.memory ? (p.monit.memory/1024/1024).toFixed(1) : 0,
          restarts: p.pm2_env.restart_time || 0,
          uptime_ms: p.pm2_env.pm_uptime || 0
        }));
        socket.emit('status', data);
      });
    });
  };

  sendStatus();
  const interval = setInterval(sendStatus, 5000);

  socket.on('restart', name => {
    pm2.connect(err => {
      if (err) return socket.emit('error', err.message);
      pm2.restart(name, err => {
        pm2.disconnect();
        if (err) return socket.emit('error', err.message);
        sendStatus();
      });
    });
  });

  socket.on('disconnect', () => clearInterval(interval));
});

http.listen(PORT, '0.0.0.0', () => console.log(`🌌 واجهة سراج جاهزة على البورت ${PORT}`));
