import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../frontend/dist/',import.meta.url));
const port=Number(process.env.LOCAL_PORT||5173);
const apiPort=Number(process.env.API_PORT||3000);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json','.woff2':'font/woff2'};
await stat(resolve(root,'index.html')); // Falla antes de escuchar si no se compiló.
const server=http.createServer(async(req,res)=>{
 if(req.url==='/api'||req.url.startsWith('/api/')){
  const upstream=http.request({hostname:'127.0.0.1',port:apiPort,path:req.url,method:req.method,headers:{...req.headers,host:`127.0.0.1:${apiPort}`}},response=>{
   res.writeHead(response.statusCode,response.headers);response.pipe(res);
  });
  upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:false,message:'Backend local no disponible'}));});
  req.on('aborted',()=>upstream.destroy());req.pipe(upstream);return;
 }
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let path=resolve(root,`.${pathname}`);
  if(path!==resolve(root)&&!path.startsWith(resolve(root)+sep)){res.writeHead(403);res.end();return;}
  if(pathname==='/'||!extname(pathname))path=resolve(root,'index.html');
  const body=await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});
  res.end(req.method==='HEAD'?undefined:body);
 }catch{res.writeHead(404);res.end('Archivo no encontrado');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Demo local: http://127.0.0.1:${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close());
