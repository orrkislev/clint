function setup(){
    const ratio = 9/16
    if (windowWidth * ratio > windowHeight) canvas = createCanvas(windowHeight / ratio, windowHeight);
    else canvas = createCanvas(windowWidth, windowWidth * ratio)
    pixelSize = canvas.width / 1500
    paperCanvas = document.getElementById('paperCanvas');
    paperCanvas.width = width;
    paperCanvas.height = height
    // canvas.elt.style.display = 'none';
    paperCanvas.style.display = 'none';
    paper.setup(paperCanvas);
    noLoop()


    CORNERS = {
        TOP_LEFT: p(-width*0.2, -height*0.2),
        TOP_RIGHT: p(width*1.2, -height*0.2),
        BOTTOM_LEFT: p(-width*0.2, height*1.2),
        BOTTOM_RIGHT: p(width*1.2, height*1.2)
    }

}

function keyPressed(){
    if (keyCode == 89) {
        if (canvas.elt.style.display == 'none') {
            canvas.elt.style.display = 'block';
            paperCanvas.style.display = 'none';
        } else {
            canvas.elt.style.display = 'none';
            paperCanvas.style.display = 'block';
        }
    }
    if (keyCode == 83) {
        var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));
        var link = document.createElement("a");
        link.download = 'this.svg';
        link.href = url;
        link.click();
    }
}