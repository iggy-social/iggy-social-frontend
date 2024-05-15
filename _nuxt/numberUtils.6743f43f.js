function t(e){const r=Number(e);return r===0?0:r<1e-10?r:r<1e-4?r.toFixed(8):r<.01?r.toFixed(6):r<1?r.toFixed(4):r<100?r.toFixed(2):Math.round(r)}export{t as g};
