allDots = 0
const drawDot = (p)=>{
    drawDotXY(p.x,p.y)
}
function drawDotXY(x,y){
    allDots++
    strokeWeight(random(1,2))
    line(x,y,x,y)
}

halfToneSize = 5
function halfTone(pos,val){
    // if (random()<val) line(pos.x,pos.y,pos.x,pos.y)
    const t = abs(pos.y%halfToneSize)/halfToneSize + abs(pos.x%halfToneSize)/halfToneSize + random()/2
    if (val>t/2) line(pos.x,pos.y,pos.x,pos.y)
}

function fillShape(ps,x=0,y=0){
    beginShape()
    ps.forEach(p => vertex(p.x+x,p.y+y))
    endShape()
}