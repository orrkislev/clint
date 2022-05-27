/// <reference path="./library/p5.global-mode.d.ts" />

const BG = '#F3F2D4'
let pencil = '#1B1B0F'

document.body.style.backgroundColor = BG

function setup() {
    canvas = createCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight));
    paper.setup()
    angleMode(DEGREES)
    noFill()
    noLoop()
    makeImage()
}



async function makeImage() {
    background(BG)
    stroke(pencil)

    // createBorder(p(width * -.2, -height * .2), DIRS.DOWN, height * 1.4)
    // createBorder(p(width * 1.2, -height * .2), DIRS.DOWN, height * 1.4)

    compCenter = new Point(random(width), random(height))
    // holeDirection = new Point(width * .5, height * .5).add(pointFromAngle(random(360)).multiply(random(height)))
    holeDirection = null
    hole = new Hole(p(width * .5, height * .5), 80)

    // create 5 guides
    const guideCenter = p(width * .5, -height * .2)
    for (let i = 0; i < 2; i++) {
        createGuide(guideCenter, pointFromAngle(i * 30), height * 2)
    }


    for (let i = 0; i < 5; i++) {
        hole = new Hole(p(random(width), random(height)), random(30, 80))
        
        // hole.mirror()
    }

    for (let i = 0; i < borders.length - 1; i++) {
        for (let j = i + 1; j < borders.length; j++) {
            borders[i].stickTo(borders[j].path)
        }
    }

    holes.forEach(hole => hole.draw())

    for (let r = 20; r < height * 1.2; r += 10) {
        const dirPath = new Path.Circle(compCenter, r)
        const intersections = getOrderedIntersections(dirPath, colliders)

        if (intersections.length == 0) continue

        for (let i = 0; i < intersections.length; i++) {
            const intersection1 = intersections[i]
            let intersection2 = intersections[i + 1] || null
            if (!intersection2) {
                intersection2 = { ...intersections[0] }
                intersection2.dist += dirPath.length
            }
            const location1 = intersection1.location
            const location2 = intersection2.location

            let angle1 = location1.point.subtract(compCenter).angle
            let angle2 = location2.point.subtract(compCenter).angle
            if (angle2 <= angle1) angle2 += 360
            const midPointNumber = floor((angle2 - angle1) / 30)
            const midPointSpacing = (angle2 - angle1) / (midPointNumber + 1)
            const midPointAngles = Array(midPointNumber).fill(0).map((a, i) => angle1 + (i + 1) * midPointSpacing)
            const midPointLocations = midPointAngles.map(angle => pointFromAngle(angle).multiply(r + 30).add(compCenter))

            if (intersection1.pathObj == intersection2.pathObj && intersection1.pathObj.path.closed) {
                const midmidPoint = pointFromAngle((angle1 + angle2) / 2).multiply(r).add(compCenter)
                if (intersection1.pathObj.path.contains(midmidPoint)) continue
            }

            const newPath = new FieldArc(location1, location2, midPointLocations)
            if (pathCollidingWith(newPath.path, colliders, [newPath])) continue

            newPath.draw()
            await timeout(0)
        }
    }

    // make lines from compCenter in 30 degrees increments
    const closestPaths = []
    for (let i = 0; i < 360; i += 30) {
        const dirPath = createDirPath(compCenter, pointFromAngle(i))
        const intersections = getOrderedIntersections(dirPath, allArcs)
        if (intersections.length == 0) continue
        closestPaths.push(intersections[0].pathObj)
    }
    // remove duplicates from closestPaths
    const uniquePaths = closestPaths.filter((path, i) => closestPaths.indexOf(path) == i)

    for (let i = 1; i < uniquePaths.length; i++) uniquePaths[0].path.addSegments(uniquePaths[i].path.segments)
    uniquePaths[0].path.closePath()

    const offsetPath = uniquePaths[0].path.clone()
    for (let i = 0; i < 3;i++) {
        offsetPath.segments.forEach(segment => {
            segment.point = segment.point.add(segment.location.normal.multiply(-10))
        })
        offsetPath.simplify(.05)

        drawPath(offsetPath)
        await timeout(0)
    }

    borders.forEach(border => border.draw())

    // startPath = new Path(new Point(-width, -100), new Point(-width, height + 100))
    // for (let i = 0; i < startPath.length; i += 20) {
    //     let last = startPath.getLocationAt(i)
    //     let next = startPath.firstSegment
    //     while (next) {
    //         const dirPath = createDirPath(last.point, new Point(1, 0))
    //         next = getNextCollision(dirPath)
    //         if (next) {
    //             if (allowedPath(last, next)) {
    //                 // const guidePoines = getGuideIntersections(last.point, next.point)
    //                 const newPath = new FieldArc(last, next)
    //                 const good = !pathCollidingWith(newPath.path, colliders, [last.curve.path, next.curve.path])
    //                 if (good) {
    //                     holes.forEach(hole => hole.applyPushes(newPath.path))
    //                     newPath.draw()
    //                 }
    //             }
    //         }
    //         last = next
    //         await timeout(0)
    //     }
    // }
    borders.forEach(border => border.draw())
    return

    // addEffect()
    // finishImage()
    // fxpreview()
}

function allowedPath(start, end) {
    if (start.curve.path == end.curve.path) return false
    if (start.curve.path.closed && start.curve.path.contains(end.point)) return false
    if (end.curve.path.closed && end.curve.path.contains(start.point)) return false
    return true
}

function isPointOnScreen(point) {
    return point.x > 0 && point.x < width && point.y > 0 && point.y < height
}

function pathCollidingWith(path, paths, filterPaths) {
    const filteredPaths = paths.filter(p => !filterPaths.includes(p))
    return filteredPaths.reduce((a, b) => a || b.intersect(path, i => isPointOnScreen(i.point)).length > 0, false)
}

function createDirPath(startPoint, dir) {
    dir.length = width * 3
    return new Path([startPoint, startPoint.add(dir)])
}

const TOO_SHORT_THRESHOLD = 0
function getNextCollision(dirPath) {
    const intersections = getOrderedIntersections(dirPath, colliders)
    if (intersections.length == 0) return null
    const nearest = allIntersections[0]
    if (nearest.dist < TOO_SHORT_THRESHOLD) return null
    return nearest.pathIntersection
}


function getGuideIntersections(startPoint, endPoint) {
    const dist = startPoint.getDistance(endPoint)
    const dirPath = new Path([startPoint, endPoint])
    const intersections = getOrderedIntersections(dirPath, guides)
    const intersectionsCloserThanNearest = intersections.filter(i => i.dist < dist)
    return intersectionsCloserThanNearest.map(i => i.pathIntersection)
}



function getOrderedIntersections(path1, pathObjs) {
    const startPoint = path1.firstSegment.point
    allIntersections = []
    pathObjs.forEach(pathObj => {
        const pathIntersections = pathObj.intersect(path1, (i) => i.offset > 3)
        pathIntersections.forEach(location => {
            const dist = location.intersection.offset
            allIntersections.push({ pathObj, location, dist })
        })
    })
    allIntersections.sort((a, b) => a.dist - b.dist)
    return allIntersections
}

function addEffect() {
    filter(ERODE)
    filter(DILATE)
}