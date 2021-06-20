
const Settings = {
    easy: {
        xCount: 9,
        bombs: 10
    },
    medium: {
        xCount: 16,
        bombs: 40
    },
    hard: {
        xCount: 24,
        bombs: 99
    },
    squareSize: 25,
    cellColors: ["#a2d149", "#aad751", "#bfe17d"],
    openCellColors: ["#d7b899", "#e5c29f", "#ff4545"],
    textColor: ["#1976d2", "#388e3c", "#d32f2f", "#7b1fa2", "#830101", "#008080", "#000000", "#808080"],
    bombImage: '',
    flagImage: ''
}

const Difficulty = {"EASY": 0, "MEDIUM": 1, "HARD": 2};

Difficulty.__proto__.indexOf = (num) => {
    for (let diff in Difficulty) {
        if (typeof Difficulty[diff] === "number") {
            if (Difficulty[diff] === num) {
                return diff;
            }
        }
    }
}

const Cell = function (x, y) {
    this.x = x;
    this.y = y;
    this.isBomb = false;
    this.number = 0;
    this.isOpen = false;
    this.isFlagged = false;
}

Cell.prototype.draw = function () {
    const locX = this.x * Settings.squareSize;
    const locY = this.y * Settings.squareSize;

    fill(this.color);
    square(locX, locY, Settings.squareSize);

    if(this.isOpen){
        if (this.isBomb) {
            fill(this.color);
            square(locX, locY, Settings.squareSize);

            fill(100);
            image(Settings.bombImage, locX+3, locY+3, Settings.squareSize-5, Settings.squareSize-5);
        }else{
            if (this.number > 0) {
                fill(Settings.textColor[this.number - 1]);
                textSize(Settings.squareSize);
                let textw = textWidth(this.number);
                text(this.number, locX + (textw/2.5), locY + (1.5*textw));
            }
        }
    }

    if(!this.isOpen && this.isFlagged){
        image(Settings.flagImage, locX, locY, Settings.squareSize-2, Settings.squareSize-2);
    }
}

Cell.prototype.resetColor = function () {
    if (this.isOpen)
        this.color = Settings.openCellColors[(this.x + this.y) % 2];
    else
        this.color = Settings.cellColors[(this.x + this.y) % 2];
    if (this.isBomb && this.isOpen) {
        this.color = Settings.openCellColors[2];
    }
}

const cells = [];

function findCell(x, y) {
    for (let cell of cells) {
        if (cell.x === x && cell.y === y)
            return cell;
    }
}

function findAdjacentCells(cell, diag) {
    let output = new Map();

    const x = cell.x;
    const y = cell.y;

    if (x - 1 >= 0) {
        output.set((x - 1) * currentSettings.xCount + y, findCell(x - 1, y));

        if (y - 1 >= 0) {
            output.set(x * currentSettings.xCount + y - 1, findCell(x, y - 1));
            if (diag)
                output.set((x - 1) * currentSettings.xCount + y - 1, findCell(x - 1, y - 1));
        }

        if (y + 1 < currentSettings.xCount) {
            if (diag)
                output.set((x - 1) * currentSettings.xCount + y + 1, findCell(x - 1, y + 1));
            output.set(x * currentSettings.xCount + y + 1, findCell(x, y + 1));
        }
    }
    if (x + 1 < currentSettings.xCount) {
        output.set((x + 1) * currentSettings.xCount + y, findCell(x + 1, y));

        if (y + 1 < currentSettings.xCount) {
            output.set(x * currentSettings.xCount + y + 1, findCell(x, y + 1));
            if (diag)
                output.set((x + 1) * currentSettings.xCount + y + 1, findCell(x + 1, y + 1));
        }

        if (y - 1 >= 0) {
            if (diag)
                output.set((x + 1) * currentSettings.xCount + y - 1, findCell(x + 1, y - 1));
            output.set(x * currentSettings.xCount + y - 1, findCell(x, y - 1));
        }
    }

    return output;
}

function openCell(cell, diag = true) {
    if (cell.isBomb) {
        for (let cell of cells) {
            if (cell.isBomb) {
                cell.isOpen = true;
                cell.resetColor();
            }
        }

        setTimeout(() => {
            alert("Game over");
            setup();
        }, 20);
    } else if (cell.number === 0) {
        cell.isOpen = true;
        cell.resetColor();

        const adjacentCells = findAdjacentCells(cell, diag);

        for (let adjacentCell of adjacentCells) {
            if (adjacentCell[1].isOpen === false) {
                adjacentCell[1].isOpen = true;
                adjacentCell[1].resetColor();
                if (adjacentCell[1].number === 0)
                    openCell(adjacentCell[1], true);
            }
        }
    } else {
        cell.isOpen = true;
        cell.resetColor();
    }

}

const selectInput = document.querySelector("#difficulty");
let gameDifficulty = Difficulty.EASY;

selectInput.onchange = () => {
    gameDifficulty = selectInput.selectedIndex;
    setup();
}

let currentSettings;

function preload(){
    Settings.flagImage = loadImage('img/flag.png');
    Settings.bombImage = loadImage('img/bomb.png');
}

function setup() {
    background(220);
    noStroke();
    textStyle(BOLD);

    cells.splice(0, cells.length);
    currentSettings = Settings[Difficulty.indexOf(gameDifficulty).toLowerCase()];

    Settings.squareSize = Math.floor(600 / currentSettings.xCount);

    const squareSize = Settings.squareSize;

    createCanvas(squareSize * currentSettings.xCount, squareSize * currentSettings.xCount);

    for (let i = 0; i < currentSettings.xCount; i++) {
        for (let j = 0; j < currentSettings.xCount; j++) {
            let cell = new Cell(j, i);
            cell.resetColor();
            cells.push(cell);
        }
    }

    for (let i = 0; i < currentSettings.bombs; i++) {
        let cell;
        do {
            const rand = Math.floor(Math.random() * Math.pow(currentSettings.xCount, 2));
            const locX = Math.floor(rand / currentSettings.xCount);
            const locY = rand % currentSettings.xCount;
            cell = findCell(locX, locY);
        } while (cell.isBomb);

        cell.isBomb = true;

        for (let cellAdjacentToBombs of findAdjacentCells(cell, true)) {
            cellAdjacentToBombs[1].number++;
        }
    }
    document.querySelector("#defaultCanvas0").addEventListener('contextmenu', event => event.preventDefault());

}

function draw() {
    for (let cell of cells) {
        cell.draw();
    }
}

function mouseReleased(event) {
    if (mouseButton === LEFT) {
        //open up cells
        //mouseX, mouseY
        if (!(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height))
            return;

        const locX = Math.floor(mouseX / Settings.squareSize);
        const locY = Math.floor(mouseY / Settings.squareSize);
        const cell = findCell(locX, locY);

        if(cell.isFlagged)
            return;

        openCell(cell);

        let everyCellOpened = true;
        for(let cell of cells){
            if(!(cell.isOpen || cell.isBomb)){
                everyCellOpened = false;
            }
        }

        setTimeout(()=>{
            if(everyCellOpened){
                alert("You won!");
                setup();
            }
        }, 20);
    } else if (mouseButton === RIGHT) {
        if (!(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height))
            return;

        const locX = Math.floor(mouseX / Settings.squareSize);
        const locY = Math.floor(mouseY / Settings.squareSize);
        const cell = findCell(locX, locY);

        cell.isFlagged = !cell.isFlagged;

        let everyBombFlagged = true;
        for(let cell of cells){
            if(cell.isBomb && !cell.isFlagged || cell.isFlagged && !cell.isBomb){
                everyBombFlagged = false;
            }
        }

        setTimeout(()=>{
            if(everyBombFlagged){
                alert("You won!");
                setup();
            }
        }, 20);


    }
}

let cellHovered;

function mouseMoved(event) {
    if (!(mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height)) {
        if (cellHovered != undefined)
            cellHovered.resetColor();
        return;
    }

    const locX = Math.floor(mouseX / Settings.squareSize);
    const locY = Math.floor(mouseY / Settings.squareSize);
    const cell = findCell(locX, locY);

    if (cell.isOpen)
        return;

    if (cellHovered != undefined && cell != cellHovered) {
        cellHovered.resetColor();
        cellHovered = cell;
    } else {
        cellHovered = cell;
    }

    cellHovered.color = Settings.cellColors[2];
}
