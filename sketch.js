/// <reference path="./library/p5.global-mode.d.ts" />

const BG = '#F3F2D4'
let pencil = '#1B1B0F'

document.body.style.backgroundColor = BG

function setup() {
    canvas = createCanvas(min(windowWidth,windowHeight), min(windowWidth,windowHeight));
    paper.setup()
    angleMode(DEGREES)
    noFill()
    noLoop()
    makeImage()
}

async function makeImage() {
    background(BG)
    stroke(pencil)

    new Border(p(width*-.2,-height*.2), DIRS.DOWN, height*1.4)
    new Border(p(width*1.2,-height*.2), DIRS.DOWN, height*1.4)

    new Hole(p(width*.5,height*.5),80)

    for (let i = 0; i<2;i++) {
        hole = new Hole(p(random(width*.2,width*.4), random(height)), 80)
        hole.mirror()
    }

    holes.forEach(hole=>hole.draw())
    borders.forEach(border=>border.draw())
    
    dir = DIRS.RIGHT.clone()
    // borders.sort((a,b)=>random(-1,1))

    for (let y=-100;y<height;y+=20){
        let doNext = true
        let last = new Segment(new Point(-width,y))
        while (doNext) {
            doNext = false
            const next = findNext(last.point,new Point(1,0))
            if (next){
                doNext = true
                if (last.curve){
                    if (last.curve.path != next.curve.path){
                        if (!(last.curve.path.closed && last.curve.path.contains(next.point)) && 
                            !(next.curve.path.closed && next.curve.path.contains(last.point))){
                            const newPath = fieldArc(last,next)
                            good = true
                            colliders.forEach(collider=>{
                                if  (collider.intersect(newPath).length>1) good = false
                            })
                            if (good) stroke(pencil)
                            else stroke(0,0)
                            if (!next.curve.path.closed && !last.curve.path.closed)
                                pushes.forEach(pushy => pushy.applyPush(newPath) )
                            drawPath(newPath)
                        }
                    }
                }
            }
            last = next
            await timeout(0)
        }
    }
    return
    
    let count = 0
    for (border of borders){
        console.time(`${count} / ${borders.length}`)
        // border = borders[3]
        for (let i = 0; i < border.length; i += 10) {
            loc = border.getLocationAt(i)
            dir.angle = map(loc.point.y,0,height,-20,20)
            const [next,mid] = findNext(border, loc.point,loc.normal, borders)
            if (next) {
                if (border.closed && border.contains(next.point)) continue
                p = fieldArc(loc,next,mid)
                good = true
                paths.forEach(b=>{
                    if (b==border || b==next.curve)return
                    if  (b.getIntersections(p).length>0)
                        good = false
                })
                if (good) stroke(pencil)
                else stroke(255,0,0,0)
                drawPath(p)
                paths.push(p)
                await timeout(0)
            }
        }
        console.timeEnd(`${count} / ${borders.length}`)
        count++
    }
    print('done')
    
    // addEffect()
    // finishImage()
    // fxpreview()
}

function findNext(startPoint, dir) {
    dir.length = width*2
    const dirPath = new Path([startPoint,startPoint.add(dir)])
    let nearest = null
    let shortestD = 100000
    colliders.forEach(collider => {
        const intersections = collider.intersect(dirPath,(i)=>i.offset>3)
        if (intersections.length > 0) {
            for (intersection of intersections){
                const d = intersection.point.getDistance(startPoint)
                if (d < shortestD) {
                    nearest = intersection
                    shortestD = d
                }
            }
        }
    })
    if (shortestD < 25) return null
    return nearest
}
























function fieldArc(loc1,loc2){
    let t1 = loc1.tangent.multiply(100)
    let t2 = loc2.tangent.multiply(100)
    if (t1.angle > 180 || t1.angle < 0) t1.angle += 180
    if (t2.angle > 180 || t2.angle < 0) t2.angle += 180
    const seg1 = new Segment(loc1.point, null, t1)
    const seg2 = new Segment(loc2.point, t2)
    const newPath = new Path([seg1, seg2])
    return newPath
}




function addEffect(){
    filter(ERODE)
    filter(DILATE)
}


