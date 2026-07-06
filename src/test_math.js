const v=[2,3,4,5,6,7];
for(let i=0;i<64;i++){
  let t=1;
  let o=[];
  for(let j=0;j<6;j++){
    if((i&(1<<j))===0){
      t+=v[j];
      o.push("+")
    }else{
      t*=v[j];
      o.push("*")
    }
  }
  if(t>50 && t<150) console.log(o.join(" "), "=", t)
}
