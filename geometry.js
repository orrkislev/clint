const Path = paper.Path
const Point = paper.Point
const Segment = paper.Segment

const DIRS = {
    UP: new Point(0,-1),
    DOWN: new Point(0,1),
    LEFT: new Point(-1,0),
    RIGHT: new Point(1,0),
}
const p = (x,y)=>new Point(x,y)
const randomPoint = ()=>new Point(random(-1,1),random(-1,1)).normalize()
const pointFromAngle = (angle)=>{
    return new Point(1,0).rotate(angle)
}

function makeSpine2(v1,v2, sunPoints){
    const dir = v2.subtract(v1)
    dir.length = 1
    dir.angle += 90
    const path = new Path()
    for (let i=0;i<=sunPoints;i++){
        const p = new Point(lerp(v1.x,v2.x,i/sunPoints), lerp(v1.y,v2.y,i/sunPoints))
        const p2 = p.add(dir.multiply(random(-50,50)))
        path.add(p2)
    }
    path.smooth()
    return path
}

function makeSpine(start, dir, totalLength){
    const segments = 10
    const segmentLength = totalLength/segments
    dir.length = segmentLength
    const path = new Path()
    path.add(start)
    for (let i=0;i<segments;i++){
        const segDir = dir.clone()
        segDir.angle += random(-15,15)
        start = start.add(segDir)
        path.add(start)
    }
    path.smooth()
    return path
}



function pathToPoints(path){
    const l = path.length
    const ps = []
    for (let i=0;i<l;i++) ps.push(path.getPointAt(i))
    return ps
}

function drawPath(path){
    const ps = pathToPoints(path)
    drawShape(ps)
}
function fillPath(path){
    const ps = pathToPoints(path)
    fillShape(ps)
}




function spiralPath(center, rounds, spacing, startRadius){
    const path = new Path()
    const start = center.clone()
    for (let i=0;i<rounds;i++){
        const dir = pointFromAngle(i*60)
        const p = start.add(dir.multiply(startRadius + i*spacing))
        path.add(p)
    }
    path.smooth()
    return path
}