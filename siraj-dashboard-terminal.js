const contrib = require("blessed-contrib");
const blessed = require("blessed");
const { exec } = require("child_process");

const screen = blessed.screen();
const grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

const table = grid.set(0, 0, 12, 12, contrib.table, {
  keys: true,
  fg: "white",
  interactive: true,
  label: "🟣 لوحة سراج الأسطورية - CPU/Memory مباشر + سجل التشغيل 🟣",
  columnSpacing: 2,
  columnWidth: [5, 20, 10, 10, 10, 15]
});

screen.key(["escape", "q", "C-c"], () => process.exit(0));

function updateTable() {
  exec("pm2 jlist", (err, stdout) => {
    if (err) return;
    let data = [];
    try {
      const list = JSON.parse(stdout);
      list.forEach(proc => {
        data.push([
          proc.pm_id.toString(),
          proc.name,
          proc.pm2_env.status,
          (proc.monit.cpu || 0).toFixed(1) + "%",
          ((proc.monit.memory || 0) / 1024 / 1024).toFixed(1) + " MB",
          proc.pm2_env.restart_time.toString(),
        ]);
      });
      table.setData({ headers: ["ID", "NAME", "STATUS", "CPU", "MEM", "RESTARTS"], data: data });
      screen.render();
    } catch(e) {}
  });
}

updateTable();
setInterval(updateTable, 2000);
