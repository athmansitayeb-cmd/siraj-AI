// مثال fetch مع إضافة التوكن تلقائياً
const token = localStorage.getItem("jwt"); // يجلب التوكن المخزن

fetch("/api/chat-stream", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`   // <-- يرسل التوكن تلقائياً
  },
  body: JSON.stringify({ message: "Hello" })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
