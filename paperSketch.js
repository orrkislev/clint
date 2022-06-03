const BG = '#F3F2D4'
document.body.style.backgroundColor = BG
let pencil = '#1B1B0F'

const pallete1 = ['#de8ba0', '#a6465b', '#e5bcb6', '#de4704', '#f8a306']
const pallete2 = ['#4861a4', '#017f82', '#1B1B0F', '#fefffe', '#37166d', '#7b0517', '#ed8845', '#de0148']
const pallete3 = ["#F65817", "#1F8734", "#A82E79", "#3E7282", "#FA9B4E"]
const pallete4 = ['#a7dfff', '#467194', '#b07967', '#78544c']
const pallete5 = ['#fd0155', '#fa76c6']
const gold = ['#a67c00', '#bf9b30', '#ffbf00', '#ffcf40', '#ffdc73']
const bw = [pencil, BG]
const colors = choose([pallete1, pallete2, pallete3, pallete4, pallete5, gold, bw])

const tangentStrengh = 120
const pushPointBack = tangentStrengh
const lineSpacing = random(8, 20)

const colorfull = random() < 0.3
const holeNumber = random(1, 10)
const mirror = random() < 0.7
const sceneDir = choose(['vertical', 'horizontal'])
const sceneStyle = choose(['arcs', 'waves'])
const withBorder = random() < 0.7
const withDisturbance = random() < 0.3

async function draw() {
    background(BG)

    // noFill()
    // stroke(pencil)
    // strokeWeight(5)
    // circle(width/2,height/2,200)
    // await floodFill(width/2,height/2,pencil)
    // return

    if (sceneDir == 'horizontal') {
        growthCenter = new Point(random(width), random(-height, height))
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

    for (hole of holes) hole.redraw()


    // FINISH IMAGE
    stroke(BG)
    strokeWeight(30 * pixelSize)
    rect(0, 0, width, height)
    rect(0, 0, width, height, 60 * pixelSize)
    borderPath = new Path.Rectangle(new paper.Rectangle(15 * pixelSize, 15 * pixelSize, width - 30 * pixelSize, height - 30 * pixelSize), 45 * pixelSize)
    borderPath.strokeColor = pencil
    if (withBorder) {
        stroke(pencil)
        drawPath(borderPath)
    }
    if (withDisturbance) disturbance()
    addEffect()
    
    finishImage()
    fxpreview()
}

function disturbance() {
    fill(pencil)
    noStroke()
    for (let i = 0; i < 1000; i++) {
        push()
        translate(random(width), random(height))
        rotate(random(360))
        ellipse(0, 0, random(10, 20) * pixelSize, random(3) * pixelSize)
        pop()
    }
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
    const arcsCenter = random(height)
    const paths = []
    for (let y = CORNERS.BOTTOM_LEFT.y; y > CORNERS.TOP_RIGHT.y; y -= lineSpacing * pixelSize) {
        const distFromCenter = y - arcsCenter
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
