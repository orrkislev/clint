const BG = '#F3F2D4'
document.body.style.backgroundColor = BG
let pencil = '#1B1B0F'

const pallete1 = ['#de8ba0', '#a6465b', '#e5bcb6', '#de4704', '#f8a306']
const pallete2 = ['#4861a4', '#017f82', '#1B1B0F', '#fefffe', '#37166d', '#7b0517', '#ed8845', '#de0148']
const pallete3 = ["#F65817", "#1F8734", "#A82E79", "#3E7282", "#FA9B4E"]
const colors = choose([pallete1, pallete2, pallete3])

const tangentStrengh = 120
const pushPointBack = tangentStrengh
const lineSpacing = random(8,20)

const colorfull = random() < 0.5
const holeNumber = random(1, 10)
const mirror = random() < 0.5
const sceneDir = choose(['vertical', 'horizontal'])
const sceneStyle = choose(['arcs', 'waves'])
const withBorder = random()<0.5

async function draw() {
    background(BG)

    // noFill()
    // stroke(pencil)
    // strokeWeight(5)
    // circle(width/2,height/2,200)
    // await floodFill(width/2,height/2,pencil)
    // return

    if (sceneDir == 'horizontal') {
        growthCenter = new Point(random(width), random(-height, 0))
        if (sceneStyle == 'arcs') fieldPaths = getFieldPaths_arcs_horizontal()
        else if (sceneStyle == 'waves') fieldPaths = getFieldPaths_waves_horizontal()
    } else if (sceneDir == 'vertical') {
        growthCenter = new Point(random(width), height / 2)
        if (sceneStyle == 'arcs') fieldPaths = getFieldPaths_arcs_vertical()
        else if (sceneStyle == 'waves') fieldPaths = getFieldPaths_waves_vertical()
    }

    for (let i = 0; i < holeNumber; i++) {
        if (mirror) Hole.RandomMirror()
        else Hole.Random()
    }

    for (hole of holes) hole.trimTail()
    for (hole of holes) hole.finalShape()
    await applyField(fieldPaths)

    for (hole of holes) await floodFill(hole.pos.x, hole.pos.y, pencil)

    // FINISH IMAGE
    stroke(BG)
    strokeWeight(30 * pixelSize)
    rect(0, 0, width, height)
    rect(0, 0, width, height, 60 * pixelSize)
    if (withBorder) {
        borderPath = new Path.Rectangle(new paper.Rectangle(15 * pixelSize, 15 * pixelSize, width - 30 * pixelSize, height - 30 * pixelSize), 45 * pixelSize)
        stroke(pencil)
        drawPath(borderPath)
    }
    addEffect()
    return
}

async function floodFill(x, y, clr) {
    x = round(x)
    y = round(y)
    colorMode(HSL)
    const fillColor = color(clr)

    loadPixels()
    const startColor = getPixelRGB(x, y)
    if (startColor == colorToRGB(fillColor)) return
    const stack = [{ pos: new Point(x, y), depth: 0 }]
    let count = 0
    while (stack.length > 0) {
        const newPos = stack.pop()
        const posColor = getPixelRGB(newPos.pos.x, newPos.pos.y)
        const sameAsStart = posColor == startColor
        if (sameAsStart || newPos.depth < 3) {
            let nextDepth = sameAsStart ? 0 : newPos.depth + 1
            if (newPos.depth > 0) nextDepth++
            setPixel(newPos.pos.x, newPos.pos.y, fillColor)
            if (count++ % 500 == 0) {
                updatePixels()
                await timeout(0)
            }
            stack.push({ pos: newPos.pos.add(new Point(-1, 0)), depth: nextDepth})
            stack.push({ pos: newPos.pos.add(new Point(0, -1)), depth: nextDepth})
            stack.push({ pos: newPos.pos.add(new Point(1, 0)), depth: nextDepth})
            stack.push({ pos: newPos.pos.add(new Point(0, 1)), depth: nextDepth})
        }
    }
    updatePixels()
}

function setPixel(x, y, clr) {
    const index = (x + y * width) * 4
    pixels[index] = red(clr)
    pixels[index + 1] = green(clr)
    pixels[index + 2] = blue(clr)
}

function comparePixelColors(x1, y1, x2, y2) {
    const index1 = (x1 + y1 * width) * 4
    const index2 = (x2 + y2 * width) * 4
    return pixels[index1] == pixels[index2] && pixels[index1 + 1] == pixels[index2 + 1] && pixels[index1 + 2] == pixels[index2 + 2]
}

function getPixelRGB(x, y) {
    const index = (x + y * width) * 4
    return pixels[index] + ',' + pixels[index + 1] + ',' + pixels[index + 2]
}
function colorToRGB(clr) {
    return red(clr) + ',' + green(clr) + ',' + blue(clr)
}

function getFieldPaths_waves_vertical() {
    const basePath = makeSpine2(CORNERS.TOP_LEFT, CORNERS.BOTTOM_LEFT, 10)
    const paths = []
    for (let x = CORNERS.TOP_LEFT.x; x < CORNERS.TOP_RIGHT.x; x += lineSpacing * pixelSize) {
        basePath.segments.forEach(p => p.point.x += lineSpacing * random(0.8, 1.2) * pixelSize)
        paths.push(basePath.clone())
    }
    return paths
}

function getFieldPaths_arcs_vertical() {
    const paths = []
    for (let x = CORNERS.TOP_LEFT.x; x < CORNERS.TOP_RIGHT.x; x += lineSpacing * pixelSize) {
        const distFromCenter = x - growthCenter.x
        newPath = new Path([p(x, CORNERS.TOP_LEFT.y), p(x + distFromCenter, height / 2), p(x, CORNERS.BOTTOM_LEFT.y)])
        newPath.smooth()
        paths.push(newPath)
    }
    return paths
}

function getFieldPaths_arcs_horizontal() {
    const paths = []
    for (let y = CORNERS.BOTTOM_LEFT.y; y > CORNERS.TOP_RIGHT.y; y -= lineSpacing * pixelSize) {
        const distFromCenter = y - growthCenter.y
        newPath = new Path([p(CORNERS.TOP_LEFT.x, y), p(width / 2, y + distFromCenter), p(CORNERS.TOP_RIGHT.x, y)])
        newPath.smooth()
        paths.push(newPath)
    }
    return paths
}

function getFieldPaths_arcs() {
    const paths = []
    for (let y = height; y >= 0; y -= lineSpacing * pixelSize) {
        newPath = new Path.Arc({ from: p(width * .5 - y, 0), through: p(width * .5, y), to: p(width * .5 + y, 0) });
        newPath.simplify(30)
        paths.push(newPath)
    }
    return paths
}

function getFieldPaths_waves_horizontal() {
    const basePath = makeSpine2(CORNERS.BOTTOM_LEFT, CORNERS.BOTTOM_RIGHT, 10)
    const paths = []
    for (let y = CORNERS.BOTTOM_LEFT.y; y > CORNERS.TOP_LEFT.y; y -= lineSpacing * pixelSize) {
        basePath.segments.forEach(p => p.point.y -= lineSpacing * random(0.8, 1.2) * pixelSize)
        paths.push(basePath.clone())
    }
    return paths
}

function getFieldPaths_circles(centerPoint) {
    const maxDistance = Math.max(...Object.values(CORNERS).map(p => centerPoint.getDistance(p)))
    const paths = []
    for (let r = 30 * pixelSize; r < maxDistance; r += lineSpacing * random(0.8, 1.2) * pixelSize) {
        newPath = new Path.Circle(centerPoint, r)
        paths.push(newPath)
    }
    return paths
}
















async function applyField(fieldPaths) {
    for (path of fieldPaths) {
        newPath = path.clone()
        const holesToTryAgain = []
        for (hole of holes) {
            const intersections = getOrderedIntersections(newPath, [hole.path])
            if (intersections.length == 1) holesToTryAgain.push(hole)
            if (intersections.length > 1) newPath = makeField(newPath, hole, intersections)
        }
        for (hole of holesToTryAgain) {
            const intersections = getOrderedIntersections(newPath, [hole.path])
            if (intersections.length > 1) newPath = makeField(newPath, hole, intersections)
        }
        newPath.strokeColor = pencil

        fillField(newPath)
        drawPath(newPath)
        await timeout(0)
    }
}

function makeField(newPath, hole, intersections) {
    const firstIntersection = intersections[0]
    const lastIntersection = intersections[intersections.length - 1]
    part1 = newPath.getSection(null, firstIntersection.point)
    part3 = newPath.getSection(lastIntersection.point, null)
    part2 = hole.path.getSection(firstIntersection.point, lastIntersection.point)
    if (part2.firstSegment.point.getDistance(part1.lastSegment.point) > 2) part2.reverse()
    hole.drawingPartOf()
    return joinAndFillet([part1, part2, part3], 100 * pixelSize, 50 * pixelSize) || newPath
}



function getOrderedIntersections(mainPath, paths) {
    allIntersections = []
    paths.forEach(path => {
        const pathIntersections = mainPath.getIntersections(path, (i) => i.offset > 3)
        pathIntersections.forEach(i => allIntersections.push(i))
    })
    allIntersections.sort((a, b) => a.offset - b.offset)
    return allIntersections
}
