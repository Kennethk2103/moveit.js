import {exec, execSync} from 'child_process';

let monitorsInfoArray = [];

const makeMonitor = (monitorNumber, port, height, width, xOffset, yOffset) => {
    return {
        monitorNumber: monitorNumber,
        port: port,
        height: height,
        width: width,
        xOffset: xOffset,
        yOffset: yOffset
    }
}


var convexhull;
(function (convexhull) {
    // Returns a new array of points representing the convex hull of
    // the given set of points. The convex hull excludes collinear points.
    // This algorithm runs in O(n log n) time.
    function makeHull(points) {
        let newPoints = points.slice();
        newPoints.sort(convexhull.POINT_COMPARATOR);
        return convexhull.makeHullPresorted(newPoints);
    }
    convexhull.makeHull = makeHull;
    // Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
    function makeHullPresorted(points) {
        if (points.length <= 1)
            return points.slice();
        // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
        // as per the mathematical convention, instead of "down" as per the computer
        // graphics convention. This doesn't affect the correctness of the result.
        let upperHull = [];
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            while (upperHull.length >= 2) {
                const q = upperHull[upperHull.length - 1];
                const r = upperHull[upperHull.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                    upperHull.pop();
                else
                    break;
            }
            upperHull.push(p);
        }
        upperHull.pop();
        let lowerHull = [];
        for (let i = points.length - 1; i >= 0; i--) {
            const p = points[i];
            while (lowerHull.length >= 2) {
                const q = lowerHull[lowerHull.length - 1];
                const r = lowerHull[lowerHull.length - 2];
                if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                    lowerHull.pop();
                else
                    break;
            }
            lowerHull.push(p);
        }
        lowerHull.pop();
        if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0].x == lowerHull[0].x && upperHull[0].y == lowerHull[0].y)
            return upperHull;
        else
            return upperHull.concat(lowerHull);
    }
    convexhull.makeHullPresorted = makeHullPresorted;
    function POINT_COMPARATOR(a, b) {
        if (a.x < b.x)
            return -1;
        else if (a.x > b.x)
            return +1;
        else if (a.y < b.y)
            return -1;
        else if (a.y > b.y)
            return +1;
        else
            return 0;
    }
    convexhull.POINT_COMPARATOR = POINT_COMPARATOR;
})(convexhull || (convexhull = {}));



export const init =  () =>{
    try{
        let monitorInfo= execSync("xrandr --listmonitors", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                throw new Error(error);
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
        }).toString()

        let monitors = monitorInfo.split("\n").filter((el) => {
            return el != "";
        });

        monitors.shift();
        monitors.forEach((monitor, index) => {
            monitor = monitor.split(" ").filter((el) => {
                return el != "";
            });

            let monitorNumber = monitor[0].slice(0, monitor[0].indexOf(":"));
            let displayInfo = monitor[2]
            let port = monitor[3];

            let displayInfoArray = displayInfo.split("x");
            let width = displayInfoArray[0].slice(0, displayInfoArray[0].indexOf("/"));
            let height = displayInfoArray[1].slice(0, displayInfoArray[1].indexOf("/"));
            let firstPlusOffset=displayInfoArray[1].indexOf("+");
            let secondPlusOffset=displayInfoArray[1].indexOf("+",firstPlusOffset+1);
            let xOffset = displayInfoArray[1].slice(firstPlusOffset+1, secondPlusOffset);
            let yOffset = displayInfoArray[1].slice(secondPlusOffset+1);
            monitorsInfoArray.push(makeMonitor(Number(monitorNumber), port, Number(height), Number(width), Number(xOffset), Number(yOffset)));         
        });
        console.log(monitorsInfoArray);

    }catch(e){
        console.error(e);
        return new Error(e);
    }
}

init()