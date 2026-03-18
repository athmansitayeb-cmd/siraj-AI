const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { exec } = require('child_process');

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

const table = grid.set(0, 0, 6, 12, contrib.table, {
  keys: true,
  fg: 'white',
  label: '🟣 لوحة سراج الأسطورية - CPU/Memory مباشر + سجل التشغيل 🟣',
  columnWidth: [5, 20, 10, 10, 10]
});

function refresh() {
  exec('pm2 jlist', (err, stdout) => {
    if (err) return;
    const data = JSON.parse(stdout).map(proc => [
      proc.pm_id,
      proc.name,
      proc.pm2_env.status,
      proc.monit.cpu.toFixed(1) + '%',
      (proc.monit.memory/1024/1024).toFixed(1)+' MB'
    ]);
    table.setData({ headers: ['ID','NAME','STATUS','CPU','MEM'], data });
    screen.render();
  });
}

refresh();
setInterval(refresh, 2000);

screen.key(['escape','q','C-c'], () => process.exit(0));
screen.render();
