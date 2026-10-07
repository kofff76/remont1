/* Local WebGL refraction; static background remains if WebGL is unavailable. */
(()=>{
 const canvas=document.getElementById('waterCanvas'),host=document.getElementById('portal');
 if(!canvas||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false});if(!gl)return;
 const vertex=`attribute vec2 a;varying vec2 uv;void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}`;
 const fragment=`precision mediump float;varying vec2 uv;uniform sampler2D tex;uniform vec2 res,img,mouse;uniform float time,energy;uniform vec3 pulses[6];
 void main(){vec2 aspect=vec2(res.x/res.y,1.);vec2 d=(uv-mouse)*aspect;float r=length(d);vec2 normal=d/max(r,.001);float wave=sin(r*38.-time*7.)*exp(-r*3.)*energy*.022;float glow=0.;
 for(int i=0;i<6;i++){vec3 p=pulses[i];float age=time-p.z;vec2 q=(uv-p.xy)*aspect;float dist=length(q);float band=exp(-pow((dist-age*.5)*8.,2.))*exp(-age*.9)*step(0.,age);wave+=sin(dist*46.-age*16.)*band*.027;glow+=band*.08;}
 vec2 offset=normal*wave/aspect;vec2 fit=vec2(1.);float screen=res.x/res.y;float image=img.x/img.y;if(screen>image)fit.y=image/screen;else fit.x=screen/image;
 vec2 st=(uv+offset-.5)*fit+.5;vec3 c=texture2D(tex,clamp(st,.002,.998)).rgb;c+=vec3(.08,.2,.25)*(glow+max(0.,wave)*8.);gl_FragColor=vec4(c,1.);}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 try{
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('WebGL link');gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 const loc={};for(const n of ['res','img','mouse','time','energy','pulses[0]'])loc[n]=gl.getUniformLocation(program,n);
 let frame=0,ready=false,inside=false,last=-10,index=0,energy=0;const start=performance.now(),mouse=[.5,.5],pulses=new Float32Array(18);for(let i=0;i<6;i++)pulses[i*3+2]=-100;
 const now=()=> (performance.now()-start)/1000;
 function pointer(e){const b=host.getBoundingClientRect();mouse[0]=(e.clientX-b.left)/b.width;mouse[1]=1-(e.clientY-b.top)/b.height;inside=true;const t=now();if(t-last>.12){pulses.set([mouse[0],mouse[1],t],index*3);index=(index+1)%6;last=t}wake()}
 host.addEventListener('pointermove',pointer,{passive:true});host.addEventListener('pointerdown',pointer,{passive:true});host.addEventListener('pointerenter',pointer,{passive:true});host.addEventListener('pointerleave',()=>{inside=false});
 function draw(){frame=0;if(!ready||host.hidden||document.hidden)return;const b=host.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5),w=Math.round(b.width*ratio),h=Math.round(b.height*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}energy+=(Number(inside)-energy)*.06;gl.uniform2f(loc.res,w,h);gl.uniform2f(loc.mouse,...mouse);gl.uniform1f(loc.time,now());gl.uniform1f(loc.energy,energy);gl.uniform3fv(loc['pulses[0]'],pulses);gl.drawArrays(gl.TRIANGLES,0,6);frame=requestAnimationFrame(draw)}
 function wake(){if(!frame&&ready&&!host.hidden&&!document.hidden)frame=requestAnimationFrame(draw)}
 new MutationObserver(wake).observe(host,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',wake);addEventListener('resize',wake);
 const picture=new Image();picture.onload=()=>{try{const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,picture);gl.uniform2f(loc.img,picture.width,picture.height);ready=true;pulses.set([.5,.5,now()],0);wake()}catch(e){canvas.style.display='none'}};picture.src='assets/portal-water.png';
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);canvas.style.display='none'});
 }catch(e){canvas.style.display='none'}
})();
