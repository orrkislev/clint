let colliders = []
let holes = []
let borders = []


class myObj{
    intersect(path, func) {
        const intersections1 = path.getIntersections(this.path, func)
        const intersections2 = intersections1.map(inter=>inter.intersection)
        return intersections2
    }
}

class Border extends myObj{
    constructor(start, dir, totalLength, type) {
        super()
        this.type = type
        const segments = 10
        const segmentLength = totalLength / segments
        dir.length = segmentLength
        this.path = new Path()
        this.path.add(start)
        for (let i = 0; i < segments; i++) {
            const segDir = dir.clone()
            segDir.angle += random(-15, 15)
            start = start.add(segDir)
            this.path.add(start)
        }
        this.path.smooth()
        borders.push(this)
        colliders.push(this)
    }

    draw(){
        stroke(pencil)
        drawPath(this.path)
    }

    stickTo(other){
        let removeFrom = null
        this.path.segments.forEach((seg,i)=>{
            const otherPoint = other.getNearestPoint(seg.point)
            if (seg.point.getDistance(otherPoint) < 50){
                seg.point = otherPoint
                if (!removeFrom) removeFrom = i+1
            }
        })
        if (removeFrom) this.path.removeSegments(removeFrom)
    }
}

class Hole extends myObj{
    constructor(position, size) {
        super()
        if (position && size){
            this.path = new Path.Circle(position, size * random(0.5, 1))
            this.path.segments.forEach(seg => {
                seg.point.y += size * random(-0.2, 0.2)
                seg.point.x += size * random(-0.2, 0.2)
            })
            this.path.segments[3].point.y += size * 0.5
            this.tail = new Border(this.path.segments[3].point, new Point(random(-1,1),1), height)
            this.makeLarger()
        }
        holes.push(this)
        colliders.push(this)
    }
    makeLarger(){
        this.pushis = []
        const larger1 = this.path.clone()
        larger1.scale(1.2,1.2)
        this.pushis.push(larger1)
        const larger2 = this.path.clone()
        larger2.scale(1.8,1.8)
        this.pushis.push(larger2)
    }

    mirror(){
        this.otherHole = new Hole()
        this.otherHole.path = this.path.clone()
        this.otherHole.path.position.x = width-this.otherHole.path.position.x
        this.otherHole.path.scale(-1,1)
        this.otherHole.tail = new Border(this.otherHole.path.segments[3].point,new Point(random(-1,1),1) ,height)
        this.otherHole.makeLarger()
    }

    applyPushes(path){
        this.pushis.forEach(pushi=>{
            const intersections = path.getIntersections(pushi)
            for (intersection of intersections){
                if (intersection.point.y < pushi.position.y){
                    const loc = path.getNearestLocation(pushi.position)
                    if (loc.point.getDistance(loc.segment.point) > 100){
                        const ind = loc.index+1
                        path.insert(ind, loc.point.add(p(0,-5)))
                        path.segments[ind].smooth()
                    }
                }
            }
        })
    }

    draw(){
        fill(pencil)
        fillPath(this.path)

        stroke(pencil)
        noFill()
        // drawPath(this.larger)
    }
}

class FieldArc extends myObj{
    constructor(loc1,loc2){
        super()
        const d = loc1.point.getDistance(loc2.point)
        const force = constrain(d/3,0,180)
        let t1 = loc1.tangent.multiply(force)
        let t2 = loc2.tangent.multiply(force)
        if (t1.angle > 180 || t1.angle < 0) t1.angle += 180
        if (t2.angle > 180 || t2.angle < 0) t2.angle += 180
        const seg1 = new Segment(loc1.point, null, t1)
        const seg2 = new Segment(loc2.point, t2)
        this.path = new Path([seg1, seg2])
    }

    draw(){
        drawPath(this.path)
    }
}