const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(morgan('tiny'));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/siraj';

const contextSchema = new mongoose.Schema({ sessionId: String, timestamp: { type: Date, default: Date.now }, text: String, meta: Object });
const knowledgeSchema = new mongoose.Schema({ title: String, content: String, sources: [String], embeddings: Object, createdAt: { type: Date, default: Date.now }});
const inferenceSchema = new mongoose.Schema({ inputRef: mongoose.Schema.Types.ObjectId, result: Object, metrics: Object, createdAt: { type: Date, default: Date.now }});

const Context = mongoose.model('Context', contextSchema);
const Knowledge = mongoose.model('Knowledge', knowledgeSchema);
const Inference = mongoose.model('Inference', inferenceSchema);

mongoose.connect(MONGO_URI, { autoIndex: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

app.get('/health', (req,res)=>res.json({status:'ok',ts:new Date()}));

app.post('/km/knowledge', async (req,res)=>{ const k = new Knowledge(req.body); await k.save(); res.status(201).json(k); });
app.get('/km/knowledge', async (req,res)=>{ const items = await Knowledge.find().limit(50).lean(); res.json({count:items.length,items}); });
app.post('/km/infer', async (req,res)=>{ const {input} = req.body; const ctx = new Context({sessionId:req.body.sessionId||'anon',text:input,meta:{}}); await ctx.save(); const inf = new Inference({inputRef:ctx._id,result:{reply:'رد تجريبي من SIRAJ'},metrics:{latency_ms:12}}); await inf.save(); res.json({inference:inf}); });
app.get('/monitor/metrics', async (req,res)=>{ res.json({ uptime:process.uptime(), memory:process.memoryUsage(), loadavg:require('os').loadavg() }); });

app.listen(PORT, ()=>console.log(`SIRAJ API running on :${PORT}`));
