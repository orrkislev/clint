const Path = paper.Path
const Point = paper.Point
const Segment = paper.Segment

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