let colliders = []
let holes = []
let borders = []
let pushes = []

class Pushy{
    constructor(path, force){
        this.path = path; this.force = force
        pushes.push(this)
    }

    applyPush(path){
        const intersections = path.getIntersections(this.path)
        for (intersection of intersections){
            if (intersection.point.y < this.path.position.y){
                const loc = path.getNearestLocation(this.path.position)
                if (loc.point.getDistance(loc.segment.point) < 100) path.segments[loc.index].point.y -= 2
                else {
                    const ind = loc.index+1
                    path.insert(ind, loc.point.add(p(0,-2)))
                    path.segments[ind].smooth()
                }
            }
        }
    }
}

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
            this.tail = new Border(this.path.segments[3].point, new Point(0, 1), height)
            this.makeLarger()
        }
        holes.push(this)
        colliders.push(this)
    }
    makeLarger(){
        const larger1 = this.path.clone()
        larger1.scale(1.2,1.2)
        new Pushy(larger1,20)
        const larger2 = this.path.clone()
        larger2.scale(1.4,1.4)
        new Pushy(larger2,20)
        const larger3 = this.path.clone()
        larger3.scale(1.6,1.6)
        new Pushy(larger3,20)
    }

    mirror(){
        this.otherHole = new Hole()
        this.otherHole.path = this.path.clone()
        this.otherHole.path.position.x = width-this.otherHole.path.position.x
        this.otherHole.path.scale(-1,1)
        this.otherHole.tail = new Border(this.otherHole.path.segments[3].point,new Point(0,1) ,height)
        this.otherHole.makeLarger()
    }

    draw(){
        fill(pencil)
        fillPath(this.path)

        stroke(pencil)
        noFill()
        // drawPath(this.larger)
    }
}
