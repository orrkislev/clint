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

    compCenter = new Point(random(width),random(height))
    // holeDirection = new Point(width * .5, height * .5).add(pointFromAngle(random(360)).multiply(random(height)))
    holeDirection = null
    hole = new Hole(p(width * .5, height * .8), 80)
    
    createBorder(compCenter,pointFromAngle(random(360)), height*2)
    for (let i = 0; i < 0; i++) {
        hole = new Hole(p(random(width), random(height)), random(30, 80))
        // hole.mirror()
    }

    for (let i = 0; i < borders.length - 1; i++) {
        for (let j = i + 1; j < borders.length; j++) {
            borders[i].stickTo(borders[j].path)
        }
    }

    holes.forEach(hole => hole.draw())
    borders.forEach(border => border.draw())

    for (let r = 50; r < height*1.2; r += 20) {
        const dirPath = new Path.Circle(compCenter, r)
        // stroke(0,20)
        // drawPath(dirPath)
        strokeColor = 0
        await drawArcs({path:dirPath}, r, [], 0)

        // stroke(0,50)
        // drawPath(dirPath)
        // const intersections = getOrderedIntersections(dirPath, colliders)

        // // get intersecion pairs
        // const pairs = []
        // for (let i = 0; i < intersections.length; i++) {
        //     const intersection = intersections[i]
        //     const nextIntersection = intersections[i + 1] || intersections[0]
        //     pairs.push([intersection, nextIntersection])
        // }


        continue

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
            const midPointNumber = floor((angle2 - angle1) / 25)
            const midPointSpacing = (angle2 - angle1) / (midPointNumber + 1)
            const midPointAngles = Array(midPointNumber).fill(0).map((a, i) => angle1 + (i + 1) * midPointSpacing)
            const midPointLocations = midPointAngles.map(angle => pointFromAngle(angle).multiply(r).add(compCenter))

            if (intersection1.pathObj == intersection2.pathObj && intersection1.pathObj.path.closed) {
                const midmidPoint = pointFromAngle((angle1 + angle2) / 2).multiply(r).add(compCenter)
                if (intersection1.pathObj.path.contains(midmidPoint)) continue
            }

            const newPath = new FieldArc(location1, location2, midPointLocations)
            stroke(pencil)
            const allCollisions = getOrderedIntersections(newPath.path, colliders, [intersection1.pathObj, intersection2.pathObj])
            if (allCollisions.length > 0) {
                stroke(255,0,0)
            }
            // if (pathCollidingWith(newPath.path, colliders, [newPath])) stroke(255,0,0)
            newPath.draw()
            await timeout(0)
        }
    }

    // make lines from compCenter in 30 degrees increments
    // const closestPaths = []
    // for (let i = 0; i < 360; i += 30) {
    //     const dirPath = createDirPath(compCenter, pointFromAngle(i))
    //     const intersections = getOrderedIntersections(dirPath, allArcs)
    //     if (intersections.length == 0) continue
    //     closestPaths.push(intersections[0].pathObj)
    // }
    // // remove duplicates from closestPaths
    // const uniquePaths = closestPaths.filter((path, i) => closestPaths.indexOf(path) == i)

    // for (let i = 1; i < uniquePaths.length; i++) uniquePaths[0].path.addSegments(uniquePaths[i].path.segments)
    // uniquePaths[0].path.closePath()

    // const offsetPath = uniquePaths[0].path.clone()
    // for (let i = 0; i < 3;i++) {
    //     offsetPath.segments.forEach(segment => {
    //         segment.point = segment.point.add(segment.location.normal.multiply(-10))
    //     })
    //     offsetPath.simplify(.05)

    //     drawPath(offsetPath)
    //     await timeout(0)
    // }

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

async function drawArcs(pathObj, radius, filterPaths = [], depth = 0) {
    const intersections = getOrderedIntersections(pathObj.path, colliders, filterPaths)
    if (intersections.length > 0 && depth < 2) {
        intersections.forEach(intersection => {
            const dir = compCenter.subtract(intersection.location.point)
            dir.length = 30
            const newPoint = intersection.location.point.add(dir)
            const placeOnPath = intersection.location.path.getNearestLocation(newPoint)
            intersection.location = placeOnPath
        })

        // get intersecion pairs
        const pairs = []
        for (let i = 0; i < intersections.length; i++) {
            const intersection = intersections[i]
            const nextIntersection = intersections[i + 1] || intersections[0]
            pairs.push([intersection, nextIntersection])
        }

        const arcsData = []
        // make round paths from pairs
        for (let i = 0; i < pairs.length; i++) {
            const location1 = pairs[i][0].location
            const location2 = pairs[i][1].location
            const newPath = makeRoundedPath(location1, location2, compCenter, radius)

            const pathMidPoint = newPath.path.getLocationAt(newPath.path.length / 2).point
            if (location1.path.closed && location1.path.contains(pathMidPoint)) continue
            if (location2.path.closed && location2.path.contains(pathMidPoint)) continue
            if (newPath.path.length < 30) continue

            const intersectionPath1 = pairs[i][0].pathObj
            const intersectionPath2 = pairs[i][1].pathObj
            arcsData.push({newPath, intersectionPath1, intersectionPath2})
        }

        
        for (data of arcsData) {
            if (round(data.newPath.path.length) == round(pathObj.path.length)) await data.newPath.draw()
            await drawArcs(data.newPath, radius, [data.intersectionPath1,data.intersectionPath2], depth + 1)
        }
    } else {
        stroke(pencil)
        await pathObj.draw()
    }
}

function makeRoundedPath(locStart,locEnd,center,radius){
    const startToCenter = locStart.point.subtract(center)
    const endToCenter = locEnd.point.subtract(center)
    const startAngle = startToCenter.angle
    const endAngle = normalAngle(endToCenter.angle)
    let angleBetween = endAngle - startAngle
    if (angleBetween < 0) angleBetween += 360
    const midPointNumber = floor(abs(angleBetween) / 25)
    const midPointSpacing = angleBetween / (midPointNumber + 1)
    const midPointAngles = Array(midPointNumber).fill(midPointNumber).map((a, i) => startToCenter.angle + (i+1) * midPointSpacing)
    const midPointLocations = midPointAngles.map(angle => pointFromAngle(angle).multiply(radius).add(center))
    return new FieldArc(locStart,locEnd,midPointLocations)
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



function getOrderedIntersections(path1, pathObjs, filterPaths = []) {
    filteredPaths = pathObjs.filter(p => !filterPaths.includes(p))
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

function addEffect() {
    filter(ERODE)
    filter(DILATE)
}