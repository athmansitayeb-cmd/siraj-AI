const blessed = require("blessed");
const axios = require("axios");

// واجهة TUI
const screen = blessed.screen({
  smartCSR: true,
  title: "Siraj Monitor"
});

// صندوق العرض الرئيسي
const box = blessed.box({
  top: "center",
  left: "center",
  width: "90%",
  height: "90%",
  content: "جاري مراقبة خدمات سراج...",
  tags: true,
  border: {
    type: "line"
  },
  style: {
    border: { fg: "cyan" },
    fg: "white"
  }
});

screen.append(box);

// تحديث البيانات كل 3 ثوانٍ
async function update() {
  try {
    const endpoints = {
      backend: "http://localhost:9090/",
      brain: "http://localhost:7070/",
      dashboard: "http://localhost:7777/",
      watchdog: "http://localhost:6060/"
    };

    let output = "";

    for (const [name, url] of Object.entries(endpoints)) {
      try {
        await axios.get(url, { timeout: 1500 });
        output += `{green-fg}${name} ✓ يعمل بنجاح{/green-fg}\n`;
      } catch (e) {
        output += `{red-fg}${name} ✗ متوقف{/red-fg}\n`;
      }
    }

    box.setContent(`حالة خدمات سراج:\n\n${output}`);
    screen.render();

  } catch (err) {
    box.setContent(`خطأ في التحديث:\n${err.message}`);
    screen.render();
  }
}

// تحديث كل 3 ثوانٍ
setInterval(update, 3000);
update();

// خروج بالضغط على q
screen.key(["q", "C-c"], () => process.exit(0));
