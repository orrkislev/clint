const Path = paper.Path
const Point = paper.Point
const Segment = paper.Segment

const DIRS = {
    UP: new Point(0, -1),
    DOWN: new Point(0, 1),
    LEFT: new Point(-1, 0),
    RIGHT: new Point(1, 0),
}
const p = (x, y) => new Point(x, y)
const randomPoint = () => new Point(random(-1, 1), random(-1, 1)).normalize()
const pointFromAngle = (angle) => {
    return new Point(1, 0).rotate(angle)
}

paper.Path.prototype.getSection = function (from, to) {
    if (typeof from === 'number') from = this.getLocationAt(from)
    else if (from instanceof paper.Point) from = this.getNearestLocation(from)
    else if (from instanceof paper.CurveLocation) from = this.getNearestLocation(from.point)
    if (!from) from = from = this.getLocationAt(0)

    if (typeof to === 'number') to = this.getLocationAt(to)
    else if (to instanceof paper.Point) to = this.getNearestLocation(to)
    else if (to instanceof paper.CurveLocation) to = this.getNearestLocation(to.point)
    if (!to) to = this.getLocationAt(this.length)

    if (from.equals(to)) return

    const newPath = this.clone()
    const newPath2 = newPath.splitAt(from.offset)
    const keepPath = newPath.getLocationOf(to.point) ? newPath : newPath2
    const keepPath2 = keepPath.splitAt(keepPath.getLocationOf(to.point).offset)
    return keepPath.getLocationOf(from.point) ? keepPath : keepPath2
}

function makeSpine2(v1, v2, sunPoints) {
    const dir = v2.subtract(v1)
    dir.length = 1
    dir.angle += 90
    const path = new Path()
    for (let i = 0; i <= sunPoints; i++) {
        const p = new Point(lerp(v1.x, v2.x, i / sunPoints), lerp(v1.y, v2.y, i / sunPoints))
        const p2 = p.add(dir.multiply(random(-50, 50)))
        path.add(p2)
    }
    path.smooth()
    return path
}

function makeSpine(start, dir, totalLength) {
    const segments = 10
    const segmentLength = totalLength / segments
    dir.length = segmentLength
    const path = new Path()
    path.add(start)
    for (let i = 0; i < segments; i++) {
        const segDir = dir.clone()
        segDir.angle += random(-15, 15)
        start = start.add(segDir)
        path.add(start)
    }
    path.smooth()
    return path
}



function pathToPoints(path) {
    const l = path.length
    const ps = []
    for (let i = 0; i < l; i++) ps.push(path.getPointAt(i))
    return ps
}

function drawPath(path) {
    const ps = pathToPoints(path)
    drawShape(ps)
}
function fillPath(path) {
    const ps = pathToPoints(path)
    fillShape(ps)
}




function spiralPath(center, rounds, spacing, startRadius) {
    const path = new Path()
    const start = center.clone()
    for (let i = 0; i < rounds; i++) {
        const dir = pointFromAngle(i * 60)
        const p = start.add(dir.multiply(startRadius + i * spacing))
        path.add(p)
    }
    path.smooth()
    return path
}

function offsetPath(path, offset) {
    const res = new Path()
    path.segments.forEach(seg => {
        const newSeg = seg.clone()
        newSeg.point = newSeg.point.add(seg.location.normal.multiply(offset))
        res.add(newSeg)
    })
    return res
}

function getFillet(path1, path2, radius) {
    const loc = path1.getIntersections(path2)[0]
    if (!loc) return null
    const reverseTangent = loc.offset > path1.length / 2 ? -1 : 1
    const toNormal = loc.point.add(loc.normal.multiply(radius))
    const toTangent = loc.point.add(loc.tangent.multiply(radius * reverseTangent))
    const path2Point = path2.getNearestLocation(toNormal)
    const path1Point = path1.getNearestLocation(toTangent)
    const seg1 = new Segment(path2Point.point, path2Point.tangent.multiply(radius * reverseTangent))
    const seg2 = new Segment(path1Point.point, path1Point.tangent.multiply(-radius * reverseTangent))
    return new Path([seg2, seg1])
}


function fillField(fieldPath) {
    const pathToFill = fieldPath.clone()
    const base1_1 = new Segment(newPath.firstSegment.point.add(p(-width, -height)))
    const base1_2 = new Segment(newPath.firstSegment.point.add(p(-width, -height)))
    const base2_1 = new Segment(newPath.lastSegment.point.add(p(width, -height)))
    const base2_2 = new Segment(newPath.lastSegment.point.add(p(width, -height)))
    pathToFill.segments.unshift(base1_2)
    pathToFill.segments.unshift(base1_1)
    pathToFill.segments.push(base2_1)
    pathToFill.segments.push(base2_2)
    colorMode(HSB)
    // fill(random(255),50,150)
    fill(BG)
    noStroke()
    fillPath(pathToFill)
    noFill()
    stroke(pencil)
    pathToFill.remove()
}

function joinAndFillet(paths, radius) {
    if (paths.includes(null)) return null
    const sections = []
    for (let i = 0; i < paths.length; i++) {
        if (i == 0) {
            if (paths[i].length > radius) sections.push(paths[i].getSection(null, paths[i].length - radius))
            else sections.push(new Path(paths[i].firstSegment.point))
        } else if (i == paths.length - 1) {
            if (paths[i].length > radius) sections.push(paths[i].getSection(radius, null))
            else sections.push(new Path(paths[i].lastSegment.point))
        } else {
            if (paths[i].length>radius*2) sections.push(paths[i].getSection(radius, paths[i].length - radius))
        }
    }

    sections[0].lastSegment.handleOut = sections[0].lastSegment.handleIn
    sections[0].lastSegment.handleOut.length = -radius

    sections[sections.length-1].firstSegment.handleIn = sections[sections.length-1].firstSegment.handleOut
    sections[sections.length-1].firstSegment.handleIn.length = -radius

    const result = new Path()
    sections.forEach(section => result.join(section))
    result.strokeWidth = 3
    return result
}