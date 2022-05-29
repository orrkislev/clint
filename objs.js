let colliders = [],
    holes = [],
    borders = [],
    guides = [],
    allObjs = [],
    allArcs = []


class myObj {
    constructor(){
        allObjs.push(this)
    }
    intersect(path, func) {
        const intersections1 = path.getIntersections(this.path, func)
        const intersections2 = intersections1.map(inter => inter.intersection)
        return intersections2
    }
}

class CurveCollider extends myObj {
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
            segDir.angle += random(-25, 25)
            start = start.add(segDir)
            this.path.add(start)
        }
        this.path.smooth()
    }

    draw() {
        stroke(pencil)
        drawPath(this.path)
    }

    stickTo(other) {
        let removeFrom = null
        this.path.segments.forEach((seg, i) => {
            const otherPoint = other.getNearestPoint(seg.point)
            if (seg.point.getDistance(otherPoint) < 50) {
                seg.point = otherPoint
                if (!removeFrom) removeFrom = i + 1
            }
        })
        if (removeFrom) this.path.removeSegments(removeFrom)
    }
}

function createBorder(start, dir, totalLength) {
    const border = new CurveCollider(start, dir, totalLength, 'border')
    borders.push(border)
    colliders.push(border)
    return border
}

function createGuide(start, dir, totalLength) {
    const guide = new CurveCollider(start, dir, totalLength, 'guide')
    guides.push(guide)
    return guide
}

class Hole extends myObj {
    constructor(position, size) {
        super()
        if (position && size) {
            this.path = new Path.Circle(position, size * random(0.5, 1))
            this.path.segments.forEach(seg => {
                seg.point.y += size * random(-0.2, 0.2)
                seg.point.x += size * random(-0.2, 0.2)
            })
            this.path.segments[3].point.y += size * 0.5
            let dirFromCompCenter
            if (holeDirection) dirFromCompCenter = holeDirection.subtract(this.path.position).normalize()
            else dirFromCompCenter = this.path.position.subtract(compCenter).normalize()
            this.path.rotate(dirFromCompCenter.angle-90)
            this.tail = createBorder(this.path.position, dirFromCompCenter, height)
            this.makeLarger()
        }
        holes.push(this)
        colliders.push(this)
    }
    makeLarger() {
        this.pushis = []
        const larger1 = this.path.clone()
        larger1.scale(1.2, 1.2)
        this.pushis.push(larger1)
        const larger2 = this.path.clone()
        larger2.scale(1.8, 1.8)
        this.pushis.push(larger2)
    }

    mirror() {
        this.otherHole = new Hole()
        this.otherHole.path = this.path.clone()
        this.otherHole.path.position.x = width - this.otherHole.path.position.x
        this.otherHole.path.scale(-1, 1)

        let dirFromCompCenter
        if (holeDirection) dirFromCompCenter = holeDirection.subtract(this.otherHole.path.position).normalize()
        else dirFromCompCenter = this.otherHole.path.position.subtract(compCenter).normalize()
        this.otherHole.tail = createBorder(this.otherHole.path.position.point, dirFromCompCenter, height)
        this.otherHole.makeLarger()
    }

    applyPushes(path) {
        this.pushis.forEach(pushi => {
            const intersections = path.getIntersections(pushi)
            for (const intersection of intersections) {
                if (intersection.point.y < pushi.position.y) {
                    const loc = path.getNearestLocation(pushi.position)
                    if (loc.point.getDistance(loc.segment.point) > 100) {
                        const ind = loc.index + 1
                        path.insert(ind, loc.point.add(p(0, -5)))
                        path.segments[ind].smooth()
                    }
                }
            }
        })
    }

    draw() {
        fill(pencil)
        strokeWeight(5)
        fillPath(this.path)

        stroke(pencil)
        noFill()
        // drawPath(this.larger)
    }
}

function normalAngle(angle) {
    while (angle < 0) angle += 360
    while (angle > 360) angle -= 360
    return angle
}

function smallerAngle(angle) {
    if (angle > 180) return angle - 360
    else return angle
}

function normalAngleSpacing(p1,p2){
    const angle1 = p1.angle
    const angle2 = p2.angle
    let angle = normalAngle(angle2-angle1)
    angle = smallerAngle(angle)
    return angle
}

class FieldArc extends myObj {
    constructor(loc1, loc2, midPoints) {
        super()
        const d = loc1.point.getDistance(loc2.point)
        const force = constrain(d > 0 ? d/4 : 50, 0, 180) 
        let t1 = loc1.tangent.multiply(force)
        let t2 = loc2.tangent.multiply(force)

        const t1Angle = normalAngle(t1.angle)
        const dir1 = compCenter.subtract(loc1.point)
        const dir1Angle = normalAngle(dir1.angle)

        const t2Angle = normalAngle(t2.angle)
        const dir2 = compCenter.subtract(loc2.point)
        const dir2Angle = normalAngle(dir2.angle)

        if (abs(t1Angle - dir1Angle) < 90) t1.angle += 180
        if (abs(t2Angle - dir2Angle) < 90) t2.angle += 180

        const seg1 = new Segment(loc1.point, null, t1)
        const seg2 = new Segment(loc2.point, t2)

        this.path = new Path()
        this.path.add(seg1)

        if (midPoints) {
            midPoints.forEach(mp => {
                const seg = new Segment(mp)
                this.path.add(seg)
            })
        }
        this.path.add(seg2)
        this.path.smooth() 

        this.path.firstSegment.handleOut = t1
        this.path.lastSegment.handleIn = t2

        allArcs.push(this)
    }

    async draw() {
        drawPath(this.path)
        await timeout(50)
    }
}