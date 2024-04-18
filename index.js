const canvas = document.getElementById("canva");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Body {
    constructor(x, y, velocity, mass, frozen, color) {
        this.x = x
        this.y = y
        this.velocity = velocity || { x: 0, y: 0 }
        this.frozen = frozen || false
        this.mass = mass || 1
        this.color = color || "white"
    }
}
class Simulation {
    constructor(canvas, softeningFactor, timeFactor) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.bodies = []
        this.G = 1
        this.softeningFactor = 20 || softeningFactor
        this.timeFactor = 0.1 || timeFactor

        this.clearStrength = 1
        this.camera = { x: 0, y: 0, zoom: 1 }
        this.followCenterOfSimulation = false

        this.avaiableScenarios = ["twoPlanetStarSystem", 'galaxy']
        this.scenarioSettings = {
            "twoPlanetStarSystem": {
                G: 1,
                softeningFactor: 20,
                timeFactor: 0.1,
                camera: {
                    x: 0,
                    y: 0,
                    zoom: 0.4
                },
                followCenterOfSimulation: false,
                clearStrength: 1
            },
            "galaxy": {
                G: 1,
                softeningFactor: 20,
                timeFactor: 0.1,
                camera: {
                    x: 0,
                    y: 0,
                    zoom: 0.1
                },
                followCenterOfSimulation: true,
                clearStrength: 1
            }
        }
        this.currentScenario = this.avaiableScenarios[0]

        this.gui = new dat.GUI()
        this.guiElement = {
            folder: [],
            controller: []
        }
        this.event = {}
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth
            this.canvas.height = window.innerHeight
        })

        this.init()
    }
    init() {
        this.clearCanvas(1, "black")
        this.loadScenario()

        let SimulationFolder = this.gui.addFolder("Simulation");
        SimulationFolder.open()
        this.guiElement.folder.push(SimulationFolder)

        let scenatioController = SimulationFolder.add(this, 'currentScenario', this.avaiableScenarios);
        scenatioController.onChange(() => {
            this.reset()
        })
        let softeningController = SimulationFolder.add(this, 'softeningFactor', 0, 100);
        let timeFactorController = SimulationFolder.add(this, 'timeFactor', 0.01, 1.00);

        let cameraZoomController = SimulationFolder.add(this.camera, 'zoom', 0, 1);
        cameraZoomController.onChange(() => {
            this.draw()
        })
        cameraZoomController.name('Camera zoom');
        let followCenterController = SimulationFolder.add(this, 'followCenterOfSimulation');
        followCenterController.name('Camera centered');

        let clearStrengthController = SimulationFolder.add(this, 'clearStrength', 0.1, 1);

        this.handleMouseAddBody()

        let resetController = this.gui.add(this, 'reset');
        resetController.name('Rest Scenario')
        this.guiElement.controller.push(scenatioController, cameraZoomController, softeningController, timeFactorController, followCenterController, resetController, clearStrengthController)


    }
    reset() {
        for (const event in this.event) {
            this.canvas.removeEventListener(event, this.event[event])
        }
        this.gui.destroy()
        this.gui = new dat.GUI()
        this.bodies = []
        this.init()
    }
    addBody(x, y, velocity, mass, forzen, color) {
        this.bodies.push(new Body(x, y, velocity, mass, forzen, color));
    }
    handleMouseAddBody() {
        let body = { x: 0, y: 0, velocity: { x: 0, y: 0 }, mass: 1, color: '#ffffff', frozen: false }

        let AddBodyParameterFoler = this.gui.addFolder("Add Body Parameter");
        AddBodyParameterFoler.open()
        this.guiElement.folder.push(AddBodyParameterFoler)

        let AddBodyMassController = AddBodyParameterFoler.add(body, 'mass')
        let AddBodyColorController = AddBodyParameterFoler.addColor(body, 'color')
        let AddBodyFrozenController = AddBodyParameterFoler.add(body, 'frozen')

        this.guiElement.controller.push(AddBodyMassController, AddBodyColorController, AddBodyFrozenController)

        const mouseDown = (e) => {
            this.addBodyClicked = true;

            let clickXFromCanvaCenter = e.offsetX - (this.canvas.width / 2)
            let clickYFromCanvaCenter = e.offsetY - (this.canvas.height / 2)
            body.x = this.camera.x + (clickXFromCanvaCenter / this.camera.zoom)
            body.y = this.camera.y + (clickYFromCanvaCenter / this.camera.zoom)

            this.addbodyClickedInfo = { startX: body.x, startY: body.y }
        }

        this.canvas.addEventListener('mousedown', mouseDown)
        this.event.mousedown = mouseDown

        const mouseUp = (e) => {
            if (!body) return
            this.addBodyClicked = false;

            let clickXFromCanvaCenter = e.offsetX - (this.canvas.width / 2)
            let clickYFromCanvaCenter = e.offsetY - (this.canvas.height / 2)

            let clickXCoordInSimulation = this.camera.x + (clickXFromCanvaCenter / this.camera.zoom)
            let clickYCoordInSimulation = this.camera.y + (clickYFromCanvaCenter / this.camera.zoom)

            body.velocity.x = ((body.x - clickXCoordInSimulation) * 0.05) * this.camera.zoom
            body.velocity.y = ((body.y - clickYCoordInSimulation) * 0.05) * this.camera.zoom
            this.addBody(body.x, body.y, { x: body.velocity.x, y: body.velocity.y }, body.mass, body.frozen, body.color)
        }
        this.canvas.addEventListener('mouseup', mouseUp)
        this.event.mouseup = mouseUp

        const mouseMove = (e) => {
            this.mousePositionOnCanvas = { x: e.offsetX, y: e.offsetY }
        }
        this.canvas.addEventListener('mousemove', mouseMove)
        this.event.mousemove = mouseMove

    }
    loadScenario() {
        for (const setting in this.scenarioSettings[this.currentScenario]) {
            this[setting] = JSON.parse(JSON.stringify(this.scenarioSettings[this.currentScenario][setting]))
        }

        switch (this.currentScenario) {
            case 'twoPlanetStarSystem':
                this.addBody(0, 0, null, 10, true, "yellow");

                this.addBody(0, 100, { x: -3.24, y: 0 }, 0.5, false, "brown");

                this.addBody(0, -500, { x: 3.24, y: 0 }, 2, false, "red");
                this.addBody(0, 500, { x: -3.24, y: 0 }, 2, false, "green");
                this.addBody(0, 520, { x: -4.0, y: 0 }, 0.001);

                this.addBody(-1500, 0, { x: 0, y: -4.0, }, 1);
                break;
            case 'galaxy':
                this.followCenterOfSimulation = true
                for (let i = 0; i < 100; i++) {
                    let radius = 1000
                    let angle = Math.random() * Math.PI * 2;
                    let hypotenuse = Math.sqrt(Math.random()) * radius;
                    let adjacent = Math.cos(angle) * hypotenuse
                    let opposite = Math.sin(angle) * hypotenuse
                    let x = adjacent
                    let y = opposite
                    let v = { x: 0, y: 0 }
                    this.addBody(x, y, null, 1, false)
                }
                break
            default:
                break;
        }
    }
    update(delta) {
        this.CenterOfSimulation = { x: 0, y: 0 }
        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i]

            let a = { x: 0, y: 0 }
            if (body.frozen === false) {
                for (let j = 0; j < this.bodies.length; j++) {
                    let otherBody = this.bodies[j]

                    if (body !== otherBody) {
                        let diff = { x: otherBody.x - body.x, y: otherBody.y - body.y }
                        let d2 = Math.sqrt(diff.x ** 2 + diff.y ** 2 + this.softeningFactor) ** 2

                        a.x += this.G * diff.x * otherBody.mass / d2
                        a.y += this.G * diff.y * otherBody.mass / d2
                    }
                }

                body.velocity.x += a.x * (delta * this.timeFactor)
                body.velocity.y += a.y * (delta * this.timeFactor)

                body.x += body.velocity.x * (delta * this.timeFactor)
                body.y += body.velocity.y * (delta * this.timeFactor)
            }
            if (this.followCenterOfSimulation === true) {
                this.CenterOfSimulation.x += body.x
                this.CenterOfSimulation.y += body.y
            }
        }
        if (this.followCenterOfSimulation === true) {
            this.CenterOfSimulation.x = this.CenterOfSimulation.x / this.bodies.length
            this.CenterOfSimulation.y = this.CenterOfSimulation.y / this.bodies.length

            this.camera.x = this.CenterOfSimulation.x
            this.camera.y = this.CenterOfSimulation.y
        }
    }
    clearCanvas(strength, color) {
        this.ctx.fillStyle = `${color}`;
        ctx.globalAlpha = strength
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1
    }
    draw() {
        this.clearCanvas(this.clearStrength, "black")

        if (this.addBodyClicked) {
            let clickXFromCam = (this.addbodyClickedInfo.startX - this.camera.x) * this.camera.zoom
            let clickYFromCam = (this.addbodyClickedInfo.startY - this.camera.y) * this.camera.zoom
            let clickXOnCanva = clickXFromCam + this.canvas.width / 2
            let clickYOnCanva = clickYFromCam + this.canvas.height / 2

            this.ctx.strokeStyle = 'green'
            this.ctx.lineWidth = this.canvas.width * 0.001
            this.ctx.beginPath()
            this.ctx.moveTo(clickXOnCanva, clickYOnCanva)
            this.ctx.lineTo(this.mousePositionOnCanvas.x, this.mousePositionOnCanvas.y)
            ctx.stroke()
        }

        for (let i = 0; i < this.bodies.length; i++) {
            let body = this.bodies[i];

            let objectXfromCam = (body.x - this.camera.x) * this.camera.zoom
            let objectYfromCam = (body.y - this.camera.y) * this.camera.zoom

            let objectXOnCanva = objectXfromCam + this.canvas.width / 2
            let objectYOnCanva = objectYfromCam + this.canvas.height / 2

            let radius = (body.mass * 2) * this.canvas.width * 0.0005 + this.canvas.width * 0.0005

            this.ctx.fillStyle = `${body.color}`;

            this.ctx.filter = `blur(${radius * Math.ceil(this.camera.zoom)}px)`;
            this.ctx.beginPath();
            this.ctx.arc(objectXOnCanva, objectYOnCanva, radius * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill()

            this.ctx.filter = 'none';
            this.ctx.beginPath();
            this.ctx.arc(objectXOnCanva, objectYOnCanva, radius * this.camera.zoom, 0, Math.PI * 2);
            this.ctx.fill()
        }
    }
}
const simulation = new Simulation(canvas);

let fps = 30;
let frameRate = 1000 / fps;
let last = Date.now()
let timeSinceLastFrame = 0;
function animate() {
    timeSinceLastFrame = Date.now() - last;
    if (timeSinceLastFrame > frameRate) {
        simulation.update(frameRate);
        simulation.draw();

        last = Date.now();
    }
    requestAnimationFrame(animate);
}
animate()