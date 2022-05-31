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
        this.path.strokeColor = 'black'
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
            // this.path.segments[3].handleIn = this.path.segments[3].handleIn.multiply(0.3)
            // this.path.segments[3].handleOut = this.path.segments[3].handleOut.multiply(0.3)
        }

        holes.push(this)
        colliders.push(this)
    }

    calcBorder(){
        this.borderStart = this.path.segments[3].point
        if (holeDirection) this.growthDirection = holeDirection
        else if (holeFocal) this.growthDirection = holeFocal.subtract(this.borderStart).normalize()
        else this.growthDirection = this.borderStart.subtract(compCenter).normalize()
        this.path.rotate(this.growthDirection.angle-90)
        createBorder(this.borderStart, this.growthDirection, height*2)
    }

    mirror() {
        this.otherHole = new Hole()
        this.otherHole.path = this.path.clone()
        this.otherHole.path.position.x = width - this.otherHole.path.position.x
        this.otherHole.path.scale(-1, 1)
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
        this.path.strokeColor = 'black'
        fill(pencil)
        stroke(pencil)
        strokeWeight(5)
        fillPath(this.path)
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

function signedAngle(a1,a2){
    let res = a1-a2
    if (res>180) res -= 360
    if (res<-180) res += 360
    return abs(res)
}





class FieldArc extends myObj {
    constructor(loc1, loc2, midPoints) {
        super()
        const d = loc1.point.getDistance(loc2.point)
        // const force = constrain(d > 0 ? d/8 : 50, 0, 180) 
        const force = tangentStrengh
        let t1 = loc1.tangent.multiply(force)
        let t2 = loc2.tangent.multiply(force)

        const t1Angle = normalAngle(t1.angle)
        const dir1 = compCenter.subtract(loc1.point)
        const dir1Angle = normalAngle(dir1.angle)

        const t2Angle = normalAngle(t2.angle)
        const dir2 = compCenter.subtract(loc2.point)
        const dir2Angle = normalAngle(dir2.angle)

        if (signedAngle(t1Angle,dir1Angle) < 90) t1.angle += 180
        if (signedAngle(t2Angle,dir2Angle) < 90) t2.angle += 180
        // if (abs(t1Angle - dir1Angle) < 90) t1.angle += 180
        // if (abs(t2Angle - dir2Angle) < 90) t2.angle += 180

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

        this.arcNum = allArcs.length
        allArcs.push(this)

        this.startPath = loc1.path
        this.endPath = loc2.path
        this.loc1 = loc1
        this.loc2 = loc2
        this.t1 = t1
        this.t2 = t2
        this.t1Angle = t1Angle
        this.t2Angle = t2Angle
        this.dir1Angle = dir1Angle
        this.dir2Angle = dir2Angle

    }

    async draw() {
        this.path.strokeColor = 'black'
        stroke(pencil)
        drawPath(this.path)
        await timeout(0)
    }
}