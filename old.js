function makefield(spine) {
    const thickness = makeThicknessPath(spine)
    const [rightSide, leftSide] = makeSides(spine, thickness)

    drawField(spine, leftSide, rightSide)

    return { spine, thickness, leftSide, rightSide }
}


function drawField(spine, leftSide, rightSide) {
    // fill(100.50)
    noStroke()
    fillShape([...pathToPoints(rightSide), ...pathToPoints(leftSide).reverse()])
    noFill()
    stroke(pencil)

    drawPath(rightSide)
    drawPath(leftSide)

    paths = []
    const l = spine.length
    for (let i = 0; i < l; i += random(30, 30)) {
        const perc = i / l
        loc_l = leftSide.getLocationAt(perc * leftSide.length)
        loc_r = rightSide.getLocationAt(perc * rightSide.length)
        loc_spine = spine.getLocationAt(i)
        seg1 = new Segment(loc_l.point, null, loc_l.tangent.multiply(80))
        seg2 = new Segment(loc_r.point, loc_r.tangent.multiply(80))
        segMid = new Segment(loc_spine.point.add(loc_spine.tangent.multiply(40)), loc_spine.normal.multiply(50), loc_spine.normal.multiply(-50))
        p = new Path([seg1, seg2])
        p.smooth()
        paths.push(p)
    }
    paths.forEach(p => drawPath(p))
}

function makeSides(spine, thickness) {
    rightSide = new Path()
    leftSide = new Path()
    for (let i = 0; i < 1; i += 1 / 10) {
        p = spine.getPointAt(i * spine.length)
        perpendicular = spine.getNormalAt(i * spine.length)
        perpendicular.length = thickness.getLocationAt(i * thickness.length).point.y
        rightSide.add(p.add(perpendicular))
        leftSide.add(p.subtract(perpendicular))
    }
    rightSide.smooth()
    leftSide.smooth()
    return [rightSide, leftSide]
}


function makeThicknessPath(spine) {
    thickness = new Path()
    for (let i = 0; i < spine.length; i += 100) {
        thickness.add(new Point(i, random(20, 100)))
    }
    thickness.smooth()
    return thickness
}


function spineConnection(field1, field2) {
    const connectionPath = new Path([field1.spine.firstSegment, field2.spine.firstSegment])
    const connectionLocation = connectionPath.getLocationAt(connectionPath.length / 2)
    spine3 = makeSpine(connectionLocation.point, connectionLocation.normal, 500)
    spine3.reverse()

    const thickness = makeThicknessPath(spine3)
    const lastThickness = thickness.lastSegment.clone()
    lastThickness.point.y = connectionPath.length / 2 + field1.thickness.firstSegment.point.y / 2 + field2.thickness.firstSegment.point.y / 2
    thickness.removeSegment(thickness.segments.length - 1)
    thickness.add(lastThickness)
    const [rightSide, leftSide] = makeSides(spine3, thickness)
    drawField(spine3, leftSide, rightSide, { reversed: true })
}


function test1() {
    spine = makeSpine(new Point(width * .4, height * .5), new Point(-0.3, 1), 400)
    spine2 = makeSpine(new Point(width * .6, height * .5), new Point(0.3, 1), 200)
    field1 = makefield(spine)
    field2 = makefield(spine2)
    spineConnection(field1, field2)
}


function test2(){
    spines = []
    borders = []
    for (let i = 0; i <= width; i += 200) {
        // borders.push(makeSpine2(new Point(i, 0), new Point(i, 1000),8))
        spines.push(makeSpine2(new Point(i + 100, 0), new Point(i + 100, 1000),10))
    }
    borders.push(makeSpine2(new Point(-width/2, -height/2), new Point(-width/2, height*1.5),8))
    borders.push(makeSpine2(new Point(width*1.5, -height/2), new Point(width*1.5, height*1.5),8))
    borders.push(makeSpine2(new Point(-width/2, -height/2), new Point(width*1.5, -height/2),8))
    borders.push(makeSpine2(new Point(-width/2, height*1.5), new Point(width*1.5, height*1.5),8))



    holes = []
    for (let i=0;i<6;i++){
        const p = new Point(width*random(-0.1,1.1),height*random(-0.1,1.1))
        holes.push(new Path.Circle(p, random(30,80)))
        borders.push(makeSpine(p,new Point(0,1), height*1.5))
    }
    holes.forEach(hole=>{
        hole.segments.forEach(seg=>{
            seg.point.y += random(-8,8)
            seg.point.x += random(-8,8)
        })
    })
    nonos = [...holes]
    borders.push(...holes)

    fill(pencil)
    holes.forEach(s => fillPath(s))
    noFill()

    borders.forEach(s => drawPath(s))

    spines.forEach(s=>{
        for (let i = 0; i < s.length; i += random(30,30)) {
            sides = findSides(s,i,borders)
            if (sides) fieldArc(sides[0],sides[1])
        }
    })
}

function findSides(spine, i, borders) {
    const loc = spine.getLocationAt(i)
    const dir = new Point(width*3,loc.point.y)
    const path1 = new Path(loc.point, loc.point.add(dir))
    const path2 = new Path(loc.point, loc.point.subtract(dir))
    
    const p1 = getClosestIntersection(loc.point ,path1, borders)
    const p2 = getClosestIntersection(loc.point, path2, borders)
    if (!p1 || !p2) return false
    return [p1,p2]
}

function getClosestIntersection(startPoint, path, borders) {

    for (nono of nonos) {
        if (nono.contains(startPoint)) {
            return null
        }
    }
    
    let nearest = null
    borders.forEach(b => {
        const intersections = path.getIntersections(b)
        if (intersections.length > 0) {
            if (nearest == null || startPoint.getDistance(intersections[0].point, true) < startPoint.getDistance(nearest.point, true)) {
                nearest = b.getNearestLocation(intersections[0].point)
            }
        }
    })
    return nearest
}


function mark(p){
    circle(p.x,p.y,50)
}


async function drawArcs(pathObj, depth = 0) {
    pathObj.path.strokeColor = 'red'
    await timeout(0)
    const intersections = getOrderedIntersections(pathObj.path, colliders)
    if (intersections.length > 0 && depth < 5) {
        pathObj.path.strokeColor = '#ff000077'
        await timeout(0)
        const locations = intersections.map(intersection => moveLocationCloser(intersection.location, compCenter, depth == 0 ? pushPointBack : 0))

        // get intersecion pairs
        const pairs = []
        if (!(pathObj instanceof FieldArc)) locations.push(locations[0])
        else {
            locations.unshift(pathObj.path.firstSegment.location)
            locations.push(pathObj.path.lastSegment.location)
        }
        for (let i = 0; i < locations.length - 1; i++) {
            const location1 = locations[i]
            const location2 = locations[i + 1]
            pairs.push([location1, location2])
        }

        const newPaths = []
        // make round paths from pairs
        for (let i = 0; i < pairs.length; i++) {
            const location1 = pairs[i][0]
            const location2 = pairs[i][1]

            const distance = location1.point.getDistance(location2.point)
            // if (distance > 3 && distance < 30) continue
            
            const newPath = createSubArc(location1, location2, pathObj.path)
            newPath.path.strokeColor = 'green'
            await timeout(0)

            // const midPoint = location1.point.add(location2.point).divide(2)
            const midPoint = newPath.path.position
            if ((location1.path.closed && location1.path.contains(midPoint)) ||
                (location2.path.closed && location2.path.contains(midPoint)) ||
                (newPath.path.length < 30) ) {
                newPath.path.dashArray = [10, 4];
                await timeout(0)
                continue
            }

            newPaths.push(newPath)
        }


        for (newPath of newPaths) {
            // if (round(data.newPath.path.length) == round(pathObj.path.length)) await data.newPath.draw()
            await drawArcs(newPath, depth + 1)
        }
    } else {
        if (pathObj instanceof myObj) {
            if (getOrderedIntersections(pathObj.path, allArcs.filter(a=>a.drawn)).length == 0) {
                pathObj.drawn = true
                await pathObj.draw()
            }
        } else {
            drawPath(pathObj.path)
        }
    }
}








function moveLocationCloser(location, point, distance) {
    const dir = point.subtract(location.point)
    dir.length = distance
    const newPoint = location.point.add(dir)
    const placeOnPath = location.path.getNearestLocation(newPoint)
    placeOnPath.point = newPoint
    return placeOnPath
}

function createSubArc(locStart,locEnd,parent){
    const nearestStartOnParent = parent.getNearestLocation(locStart.point)
    const nearestEndOnParent = parent.getNearestLocation(locEnd.point)
    const segmentLength = parent.length / 80
    const startOffset = nearestStartOnParent.offset + segmentLength*3
    let endOffset = nearestEndOnParent.offset - segmentLength*3
    if (endOffset <= startOffset && parent.closed) endOffset += parent.length
    const lengthToAddPoints = endOffset - startOffset
    if (lengthToAddPoints < segmentLength) return new FieldArc(locStart,locEnd,[])
    const pointsToAdd = floor(lengthToAddPoints / segmentLength)-1
    const spacing = segmentLength
    const newPointsOffsets = Array(pointsToAdd).fill(pointsToAdd).map((a, i) => startOffset + i * spacing)
    const newPoints = newPointsOffsets.map(offset => parent.getPointAt(offset % parent.length))
    newPoints.forEach(p => new Path.Circle({center:p, radius:5, fillColor:'#ff000077'}))
    return new FieldArc(locStart, locEnd, newPoints)
}

function getOrderedIntersections(path1, pathObjs) {
    let filteredPaths = [...pathObjs]
    if (path1 instanceof FieldArc) {
        filteredPaths = filteredPaths.filter(p => p.path == path1.startPath || path1.endPath)
    }
    allIntersections = []
    filteredPaths.forEach(pathObj => {
        const pathIntersections = pathObj.intersect(path1, (i) => i.offset > 3 && i.offset < path1.length - 3)
        pathIntersections.forEach(location => {
            const dist = location.intersection.offset
            allIntersections.push({ pathObj, location, dist })
        })
    })
    allIntersections.sort((a, b) => a.dist - b.dist)
    return allIntersections
}

function makeBorders() {
    holes.forEach(hole => hole.calcBorder())

    createBorder(p(-200,-200), DIRS.DOWN, height*1.4)
    createBorder(p(width+200,-200), DIRS.DOWN, height*1.4)
    // createBorder(p(-200,-200), DIRS.RIGHT, width*1.4)
    // createBorder(p(-200,height+200), DIRS.RIGHT, width*1.4)

    // createBorder(compCenter, pointFromAngle(random(360)), height * 2)

    for (let i = 0; i < borders.length - 1; i++) {
        for (let j = i + 1; j < borders.length; j++) {
            borders[i].stickTo(borders[j].path)
        }
    }
}


function stuff(){
    compCenter = new Point(width / 2, 0)
    holeFocal = null
    holeDirection = DIRS.DOWN

    background(BG)
    makeHoles()
    makeBorders()

    holes.forEach(hole => hole.draw())
    borders.forEach(border => border.draw())

    baseLines = createBaseLines()
    for (baseLine of baseLines) {
        await drawArcs({ path: baseLine }, 0)
    }
}


function createBaseLines() {
    let baseLineType = choose(['horizontal', 'vertical', 'circles',])
    baseLineType = 'circles'
    const baseLines = []
    if (baseLineType == 'horizontal') {
        r = 0
        for (let y = 0; y < height; y += lineSpacing * random(0.6, 1)) {
            const dirPath = new Path([p(-width * 0.5, y), p(width / 2, y + r), p(width * 1.5, y)])
            dirPath.smooth()
            baseLines.push(dirPath)
            r += 15
        }
    } else if (baseLineType == 'vertical') {
        for (let x = 0; x < width; x += lineSpacing * random(0.6, 1)) {
            const dirPath = new Path([p(x, -height * 0.5), p(x, height * 1.5)])
            baseLines.push(dirPath)
        }
    } else if (baseLineType == 'circles') {
        const corners = [new Point(0, 0), new Point(width, 0), new Point(width, height), new Point(0, height)]
        const maxDist = corners.reduce((a, b) => max(a, b.getDistance(compCenter)), 0)
        for (let r = 50; r < maxDist; r += lineSpacing) {
            const dirPath = new Path.Circle(compCenter, r)
            dirPath.rotate(180)
            baseLines.push(dirPath)
        }
    }
    return baseLines
}




function makeHoles() {
    // spiral = spiralPath(p(width/2,height*1.5),30,30, 100)
    // const numPoints = 50
    // const spiralLength = spiral.length
    // const spacing = spiralLength / (numPoints + 1)
    // const points = Array(numPoints).fill(numPoints).map((a, i) => spiral.getLocationAt(i * spacing).point)

    // for (let i = 0; i < points.length; i++) {
    //     new Hole(points[i], random(30, 50))
    // }
    new Hole(p(width / 2, height / 2), 150)
}


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