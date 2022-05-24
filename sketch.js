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

    for (let i=0;i<borders.length-1;i++){
        for (let j=i+1;j<borders.length;j++){
            borders[i].stickTo(borders[j].path)
        }
    }

    holes.forEach(hole=>hole.draw())
    
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
                            const newPath = new FieldArc(last,next)
                            good = true
                            colliders.forEach(collider=>{
                                if  (collider.intersect(newPath.path).length>1) good = false
                            })
                            if (good) {
                                // colliders.push(newPath)
                                holes.forEach(hole=>hole.applyPushes(newPath.path))
                                newPath.draw()
                            }
                        }
                    }
                }
            }
            last = next
            await timeout(0)
        }
    }
    borders.forEach(border=>border.draw())
    return
    
    // addEffect()
    // finishImage()
    // fxpreview()
}

function findNext(startPoint, dir) {
    dir.length = width*3
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

function addEffect(){
    filter(ERODE)
    filter(DILATE)
}