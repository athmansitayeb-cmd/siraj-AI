import http from "http";
const PORT = process.env.PORT || 9090;
const server = http.createServer((req,res)=>{
  res.writeHead(200,{"Content-Type":"text/plain"});
  res.end("🚀 Siraj Backend (auto-repaired)\n");
});
server.listen(PORT,()=>console.log(`Siraj backend restored and running on port ${PORT}`));
