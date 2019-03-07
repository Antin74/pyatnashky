/**
In a new object, we receive a property
Required: 
	divSquare - ID for Div with game, 
	size - size of game, 
Not required:
	btnForResolveID
**/
class SquareGame {

    constructor(divSquare, size, btnForResolveID = '') {
        this.mustMoveNeedValue = 0;
        this.lastGoodPos = 0;

        var thisGame = this;

        this.btnForResolveID = btnForResolveID;
        this.sizeSquare = size;
        this.divSquare = divSquare;
        this.countStirGame = 50;

        // Not realised now
        //this.waitResolveStep = 0;

        this.stepsNullForClearWay = [];
        this.lastCoordNullForResolve = {};
        this.resolveInverse = 0;

        //first Value for Cell
        var valueCell = 1;

        this.posNullY = this.sizeSquare;
        this.posNullX = this.sizeSquare;

        var finalVal = this.sizeSquare * this.sizeSquare;
        this.finalVal = finalVal;

        // Start generate output for game  
        var html = `<div id="msg_${this.divSquare}" style="color:red;"></div>`;
        for (var y = 1; y <= this.sizeSquare; y++) {
            html += `<div class="s_row" >`;

            for (var x = 1; x <= this.sizeSquare; x++) {

                if (valueCell == (finalVal))
                    valueCell = '';

                html += '<div class="s_col" data-x="' + x + '" data-y="' + y + '" data-position="' + valueCell + '">' + valueCell + '</div>';
                valueCell++;
            }

            html += ' </div>';
        }
        // -- end generate output for game
        $(`#${this.divSquare}`).html(html);

        this.showMsg('');
        this.clearEventOnDocument();

        // Click on cell game
        $(`#${this.divSquare} .s_col`).on('click', function() {
            // if user move, that set defaultValues
            thisGame.stepsNullForClearWay = [];
            thisGame.lastGoodPos = 0;
            thisGame.mustMoveNeedValue = 0;

            var x = $(this).data('x');
            var y = $(this).data('y');

            thisGame.moveToCords({
                x: thisGame.posNullX,
                y: thisGame.posNullY
            }, {
                x: x,
                y: y
            });

        });

        if (btnForResolveID) {
            if ($(`#${btnForResolveID}`).prop('disabled')) {
                $(`#${btnForResolveID}`).prop('disabled', false);
            }

            $(`#${btnForResolveID}`).click(function() {
                // ! Need resolve error with "promise" for block Resolve btn
                thisGame.showMoveForResolve();
            });
        }

        this.stirSquare();

    }

    /*Clear event, from old object*/
    clearEventOnDocument() {
        $(document).off('click', `#${this.divSquare} .s_col`);

        if (this.btnForResolveID) {
            $(`#${this.btnForResolveID}`).off('click');
        }
    }

    // Stir cell in a game
    stirSquare() {
        var randomWay = 0;
        var newPos = {};

        for (var i = 0; i < this.countStirGame; i++) {
            randomWay = this.genRandomInteger(1, 4);

            switch (randomWay) {
                case 1: // up
                    newPos.x = this.posNullX;
                    newPos.y = this.posNullY - 1;
                    break;
                case 2: // right
                    newPos.x = this.posNullX + 1;
                    newPos.y = this.posNullY;
                    break;
                case 3: // down
                    newPos.x = this.posNullX;
                    newPos.y = this.posNullY + 1;
                    break;
                case 4: // left
                    newPos.x = this.posNullX - 1;
                    newPos.y = this.posNullY;
                    break;
                default:
                    showErrors('Error in refresh');
            }

            this.moveToCords({
                x: this.posNullX,
                y: this.posNullY
            }, newPos, 1);

        }
    }

    getTextByCoord(x, y, massGame = []) {
        var text = $(`#${this.divSquare} [data-x="${x}"][data-y="${y}"]`).text();

        return text;
    }

    setTextByCoord(x, y, text) {
        if (!text) {
            this.posNullY = y;
            this.posNullX = x;
        }

        $(`#${this.divSquare} [data-x="${x}"][data-y="${y}"]`).text(text);

        return;
    }

    moveToCords(oldCoord, newPos, dontCheckWin = 0) {

        if (
            ((Math.abs(oldCoord.x - newPos.x) + Math.abs(oldCoord.y - newPos.y)) == 1) &&
            (newPos.x <= (this.sizeSquare)) &&
            ((newPos.x > 0) && (newPos.y > 0)) &&
            (newPos.y <= (this.sizeSquare))
        ) {

            var oldCoordText = this.getTextByCoord(oldCoord.x, oldCoord.y);
            var newPosText = this.getTextByCoord(newPos.x, newPos.y);

            if (!((oldCoordText == '') || (newPosText == ''))) {
                return false;
            }

            this.setTextByCoord(oldCoord.x, oldCoord.y, newPosText);
            this.setTextByCoord(newPos.x, newPos.y, oldCoordText);

            if (!oldCoordText)
                this.lastCoordNullForResolve = oldCoord;
            else
                this.lastCoordNullForResolve = newPos;

            if (!dontCheckWin) {
                this.checkWin();
            }

            return true;
        }

        return false;
    }

    getGameArrayFromShowWithChange(oldCoord, newCoord) {
        var gameArray = [];

        for (var x = 1; x <= this.sizeSquare; x++) {
            gameArray[x] = [];
            
            for (var y = 1; y <= this.sizeSquare; y++) {
                var valCell = $(`#${this.divSquare} [data-x=${x}][data-y=${y}]`).text();
                // console.log(`${x}  ${y} ${valCell}`);
                gameArray[x][y] = valCell;
            }
        }

        // moveValues, than we can have newPosition for Analyze
        var tempVal = gameArray[oldCoord.x][oldCoord.y];
        gameArray[oldCoord.x][oldCoord.y] = gameArray[newCoord.x][newCoord.y];
        gameArray[newCoord.x][newCoord.y] = tempVal;

        return gameArray;
    }

    getCountGoodPos() {
        var thisGame = this;
        var countGoodPos = 0;
        var BreakException = {};

        try {

            $(`#${this.divSquare} .s_col`).each(function() {
                var val = $(this).text();
                var mustVal = $(this).data('position');

                if (val != mustVal) {
                    throw BreakException;
                } else {
                    countGoodPos++;
                }
            });

        } catch (e) {
            if (e !== BreakException) throw e;
        }

        return countGoodPos;
    }

    getCountGoodPosFromGameArray(gameArray) {
        var countGoodPos = 0;

        for (var x = 1; x <= this.sizeSquare; x++) {

            for (var y = 1; y <= this.sizeSquare; y++) {
                var mustVal = this.getPositionByCoord({
                    x: x,
                    y: y
                });

                if (mustVal == gameArray[x][y]) {
                    countGoodPos++;
                } else {
                    return countGoodPos;
                }
            }
        }

        return countGoodPos;
    }

   checkWin() {
        var countGoodPos = this.getCountGoodPos();
        //this.lastGoodPos = countGoodPos;

        if (countGoodPos == (this.finalVal)) {
            this.clearEventOnDocument();
            this.showMsg('Congratulation. You WIN ! =)');
        }
    }

    getCoordByVal(value) {
        var element = $(`#${this.divSquare} div.s_col:contains('${value}')`);

        if (element.length)
            return {
                x: element.data('x'),
                y: element.data('y')
            };
        else
            return {};
    }

    getCoordByPosition(pos) {
        var x = (pos) % this.sizeSquare;

        if (!x)
            x = this.sizeSquare;

        var coord = {
            x: x,
            y: Math.ceil(pos / this.sizeSquare)
        };

        return coord;
    }

    getPositionByCoord(coord) {
        return (this.sizeSquare * (coord.y - 1)) + coord.x;
    }

    // needVal {x,y}- it is difficult +4. because we must get round
    // needVal - need Value to Move
    getDistanceCoord(start, final, needVal = 0) {
        var countStep = Math.abs(final.x - start.x) + Math.abs(final.y - start.y);

        if (needVal == 0)
            return countStep;

        var wayMeetNeedVal = this.checkWayMeetNeedVal(start, final, needVal);
        if (wayMeetNeedVal) {
            countStep = countStep + 4;
        }

        return countStep;
    }


    checkDigitIsBetween(start, final, between) {
        if (final < start) {
            var t = start;
            start = final;
            final = t;
        }

        if ((between > start) && (between < final))
            return true;

        return false;
    }

    checkWayMeetNeedVal(coordStep, coordFinal, coordMeet) {

        if ((coordStep.x == coordMeet.x) && (coordMeet.x == coordFinal.x)) {
            if (this.checkDigitIsBetween(coordStep.y, coordFinal.y, coordMeet.y)) {
                return true;
            }
        }

        if ((coordStep.y == coordMeet.y) && (coordMeet.y == coordFinal.y)) {
            if (this.checkDigitIsBetween(coordStep.x, coordFinal.x, coordMeet.x)) {
                return true;
            }
        }

        return false;
    }

    // clear Way for Step
    clearWay(coordNeedVal, coordFinalStep, coordFinalCell) {
        console.log('Final Cell Here');
        console.log(coordFinalCell);

        var coordNull = {
            x: this.posNullX,
            y: this.posNullY
        };
        var possibleStepsNull = this.getPossibleStep(coordNull, 0);

        var thisGame = this;

        var nextStepNull = {
            'distanceToFinalStep': -1,
            coord: {},
            'distanceToFinalCell': -1
        }; // coord, distanceToFinalStep

        var posNeedVal = this.getPositionByCoord(coordNeedVal);

        possibleStepsNull.forEach(function(coordStep, i) {

            var stepPosNull = thisGame.getPositionByCoord(coordStep);
            var lastCoordNull = thisGame.lastCoordNullForResolve;

            console.log('Test Step:');
            console.log(coordStep);

            if (
                ((coordStep.x != coordNeedVal.x) || (coordStep.y != coordNeedVal.y))
                //&& (! thisGame.stepsNullForClearWay.includes(stepPosNull)) 
                //&& ( (lastCoordNull.x != coordStep.x) || (lastCoordNull.y != coordStep.y) ) 
            ) {

                var distanceToFinalStep = thisGame.getDistanceCoord(coordStep, coordFinalStep, coordNeedVal);
                var distanceToFinalCell = thisGame.getDistanceCoord(coordStep, coordFinalCell, coordNeedVal);

                ///var gameArrayWithChange =
                // thisGame.getGameArrayFromShowWithChange(coordNull, coordStep);

                //var goodPosWithChange = thisGame.getCountGoodPosFromGameArray(gameArrayWithChange);
                //var difficult = thisGame.finalVal - goodPosWithChange;

                console.log(`distanceToFinalStep : ${distanceToFinalStep}, \
							distanceToFinalCell ${distanceToFinalCell}`);
                //console.log(`difficult: ${difficult}`);

                console.log('----')

                var changeNextStep = false;

                if (nextStepNull.distanceToFinalStep < 0) {
                    changeNextStep = true;
                };

                if (nextStepNull.distanceToFinalStep > distanceToFinalStep) {
                    changeNextStep = true;
                };

                if ((nextStepNull.distanceToFinalStep == distanceToFinalStep) &&
                    (nextStepNull.distanceToFinalCell > distanceToFinalCell)) {
                    changeNextStep = true;
                };

                if (changeNextStep) {
                    nextStepNull.distanceToFinalCell = distanceToFinalCell;
                    nextStepNull.distanceToFinalStep = distanceToFinalStep;
                    nextStepNull.coord = coordStep;
                }
            }
        });

        //if(! nextStepNull.coord) { 
        //	thisGame.lastCoordNullForResolve = {x: 0, y: 0};
        //	thisGame.clearWay(coordNeedVal, coordFinalStep, coordFinalCell);
        //}
        console.log('Chosen Step:');
        console.log(nextStepNull);
        console.log('Next step do -------------------');

        thisGame.moveToCords(coordNull, nextStepNull.coord);

    }

    showMoveForResolve() {

        // thisGame.lastCoordNullForResolve
        if (this.mustMoveNeedValue > 0) {
            this.moveValueToNeedPos(cellPos);
            return;
        }


        for (var cellPos = 1; cellPos < this.finalVal; cellPos++) {

            var cellVal = $(`#${this.divSquare} [data-position=${cellPos}]`).text();

            if (cellVal == cellPos) {
                continue;
            }

            /*
            !!! Not realised. 
            Error.
            П.с. Надо додумать, если программа встала на моменте, когда зациклились ходы. 
            Пример такой комбинаци
            120
            543
            876

            if(this.lastGoodPos > cellPos) {
            }
            */

            //console.log(`lastGoodPos ${this.lastGoodPos}, \
            //				nowGoodPos: ${cellPos} \
            //				moveValueToNeedPos: ${this.mustMoveNeedValue}`);

            if (this.moveValueToNeedPos(cellPos)) {
                this.lastGoodPos = cellPos;
            } else {
                this.lastGoodPos = cellPos - 1;
            }

            return;
        };

        return;
    }


    moveValueToNeedPos(cellPos) {
        var thisGame = this;
        var nextStep = {};

        var coordNeedVal = this.getCoordByVal(cellPos);
        //coord, where must be need value
        var coordFinalCell = this.getCoordByPosition(cellPos);
        var possibleSteps = this.getPossibleStep(coordNeedVal, coordFinalCell);

        var notMoveNull = 0;

        possibleSteps.forEach(function(possStep, i, possibleSteps) {

            var checkMove = thisGame.moveToCords(coordNeedVal, possStep);
            if (checkMove) {
                thisGame.stepsNullForClearWay = [];
                notMoveNull = 1;
                return;
            }

            nextStep = possStep;
        });

        if (!nextStep) {
            this.showMsg('No have steps.');
            return false;
        }

        if (notMoveNull) {
            return true;
        }

        var coordNull = {
            x: this.posNullX,
            y: this.posNullY
        };

        this.clearWay(coordNeedVal, nextStep, coordFinalCell);
        return false;
    }


    getPossibleStep(start, final) {
        var nextSteps = [];
        var xStepCount = 0;
        var yStepCount = 0;
        var checkGetAllStep = 0;

        if ((final.hasOwnProperty('x')) && (final.hasOwnProperty('y'))) {
            xStepCount = final.x - start.x;
            yStepCount = final.y - start.y;
        } else
            checkGetAllStep = 1;

        if (((xStepCount > 0) || checkGetAllStep) &&
            ((start.x + 1) <= this.sizeSquare)) {
            nextSteps.push({
                x: start.x + 1,
                y: start.y
            });
        }

        if (((xStepCount < 0) || checkGetAllStep) &&
            ((start.x - 1) > 0)) {
            nextSteps.push({
                x: start.x - 1,
                y: start.y
            });
        }

        if (((yStepCount < 0) || checkGetAllStep) &&
            ((start.y - 1) > 0)) {
            nextSteps.push({
                x: start.x,
                y: start.y - 1
            });
        }

        if (((yStepCount > 0) || checkGetAllStep) &&
            ((start.y + 1) <= this.sizeSquare)) {
            nextSteps.push({
                x: start.x,
                y: start.y + 1
            });
        }

        return nextSteps;
    }

    showMsg(msg) {
        $(`#msg_${this.divSquare}`).text(msg);
    }

    genRandomInteger(min, max) {
        var randomInt = min - 0.5 + Math.random() * (max - min + 1);
        randomInt = Math.round(randomInt);
        return randomInt;
    }
}