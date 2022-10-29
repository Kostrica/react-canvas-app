import React, { useEffect, useRef, useState } from "react";

import styles from "./Canvas.module.scss";

const initialLine = {
  start: null,
  end: null,
};

const workingWithElements= (array, element, number = 1) => {
  if (array.length) {
    const newArray = array.map(elem => elem);

    if (element) {
      newArray.splice(array.length - 1, number, element);
    } else {
      newArray.splice(array.length - 1, number);
    }

    return newArray;
  }
};

const findThePointOfIntersectionOfTheLines = (currentLine, lastLine) => {
  const { start: a1, end: b1 } = currentLine;
  const { start: a2, end: b2 } = lastLine;

  const x1 = a1.x;
  const x2 = b1.x;
  const x3 = a2.x;
  const x4 = b2.x;
  const y1 = a1.y;
  const y2 = b1.y;
  const y3 = a2.y;
  const y4 = b2.y;

  const c2x = x3 - x4;
  const c3x = x1 - x2;
  const c2y = y3 - y4;
  const c3y = y1 - y2;

  // down part of intersection point formula
  const d  = c3x * c2y - c3y * c2x;

  if (d === 0) {
    return;
  }

  // upper part of intersection point formula
  const u1 = x1 * y2 - y1 * x2;
  const u4 = x3 * y4 - y3 * x4;

  // intersection point formula
  const px = +((u1 * c2x - c3x * u4) / d).toFixed(0);
  const py = +((u1 * c2y - c3y * u4) / d).toFixed(0);

  const p = { x: px, y: py };

  const distance = (a, b) => {
    return + (Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)).toFixed(0);
  }

  const isBetween = (a, p, b) => {
    return distance(a, p) + distance(p, b) === distance(a, b)
      || distance(a, p) + distance(p, b) === distance(a, b) - 1
      || distance(a, p) + distance(p, b) === distance(a, b) + 1;
  }

  if (isBetween(a1, p, b1) && isBetween(a2, p, b2)) {
    return p;
  }
};

const Canvas = ({ collapseLines, getNotCollapseLines }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [ isDrawing, setIsDrawing ] = useState(false);
  const [ line, setLine ] = useState(initialLine);
  const [ coordinats, setCoordinats ] = useState([]);
  const [ points, setPoints ] = useState([]);
  const [ currentPoints, setCurrentPoints ] = useState([]);

  const drawAPoint = (point) => {
    const { x, y } = point;

    contextRef.current.beginPath();
    contextRef.current.arc(x, y, 4, 0, 2 * Math.PI);
    contextRef.current.fillStyle = 'red';
    contextRef.current.strokeStyle = 'black';
    contextRef.current.fill();
    contextRef.current.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = 800;
    canvas.height = 500;

    const context = canvas.getContext('2d');

    context.lineCap = 'round';
    context.strokeStyle = 'black';
    context.lineWidth = 1;
    contextRef.current = context;
  }, []);

  useEffect(() => {
    if (collapseLines) {
      setTimeout(() => {
        const newCoordinats = [];

        coordinats.forEach(line => {
          const { start, end } = line;
          const x1 = start.x;
          const x2 = end.x;
          const y1 = start.y;
          const y2 = end.y;
          let a, b, c, d;
          const setCoordinat = (a, b) => +((b + a) / 2).toFixed(2);

          if (x2 - x1 > 1 || y2 - y1 > 1) {
            a = setCoordinat(x1, x2);
            b = setCoordinat(y1, y2);
            c = setCoordinat(x2, x1);
            d = setCoordinat(y2, y1);

            for (let i = 0; i < 4; i++) {
              a = setCoordinat(x1, a);
              b = setCoordinat(y1, b);
              c = setCoordinat(c, x2);
              d = setCoordinat(d, y2);
            }

            const newLine = {
              start: {
                x: a,
                y: b,
              },
              end: {
                x: c,
                y: d,
              },
            };

            newCoordinats.push(newLine);
          }
        });

        setPoints([]);
        setCoordinats(newCoordinats);
      }, 60);

      if (coordinats.length === 0) {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setCurrentPoints([]);
        getNotCollapseLines();
      }
    }
  }, [collapseLines, getNotCollapseLines, coordinats, points]);

  useEffect(() => {
    if (coordinats.length) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      coordinats.forEach(line => {
        const { start, end } = line;

        contextRef.current.beginPath();
        contextRef.current.moveTo(start.x, start.y);
        contextRef.current.lineTo(end.x, end.y);
        contextRef.current.stroke();
        contextRef.current.closePath();
      });

      if (points.length) {
        points.forEach(point => {
          drawAPoint(point);
        });
      }

      if (coordinats.length > 1) {
        const lastLine = coordinats[coordinats.length - 1];
        const newCurrentPoints = [];

        coordinats.forEach(line => {
          const point = findThePointOfIntersectionOfTheLines(line, lastLine);

          if (typeof point === 'object') {
            newCurrentPoints.push(point);
          }
        });

        if (newCurrentPoints.length) {
          setCurrentPoints(newCurrentPoints);
        }
      }
    }
  }, [coordinats, points]);

  useEffect(() => {
    if (currentPoints.length) {
      currentPoints.forEach(point => {
        drawAPoint(point);
      });
    }
  }, [currentPoints]);

  useEffect(() => {
    if (line.end) {
      if (line.start.x === line.end.x && line.start.y === line.end.y) {
        setCoordinats(prevCoordinats => prevCoordinats.concat(line));
      } else {
        setCoordinats(prevCoordinats => workingWithElements(prevCoordinats, line));
      }
    }
  }, [line]);

  const mouseDownHandler = ({nativeEvent}) => {
    nativeEvent.preventDefault();

    const { offsetX, offsetY, button } = nativeEvent;
    const startPoint = {
      x: offsetX,
      y: offsetY,
    };

    if (button === 0) {
      if (!isDrawing) {
        setLine(prevLine => ({
          ...prevLine,
          start: startPoint,
          end: startPoint,
        }));

        setIsDrawing(true);
      }

      if (isDrawing) {
        setPoints(prevPoints => prevPoints.concat(currentPoints));
        setIsDrawing(false);
        setLine(initialLine);
      }
    }

    if (isDrawing && button === 2) {
      setCoordinats(prevCoordinats => workingWithElements(prevCoordinats));
      setIsDrawing(false);
    }
  };

  const mouseMoveHandler = ({nativeEvent}) => {
    nativeEvent.preventDefault();

    if (isDrawing) {
      const { offsetX, offsetY } = nativeEvent;

      setLine(prevLine => ({
        ...prevLine,
        end: {
          x: offsetX,
          y: offsetY,
        },
      }));
    }
  };

  const mouseUpHandler = ({nativeEvent}) => {
    const { button } = nativeEvent;

    if (button === 2) {
      window.oncontextmenu = (() => {
        return false;
      });
    }
  };

  return (
    <canvas
      className={styles.container}
      ref={canvasRef}
      onMouseDown={mouseDownHandler}
      onMouseMove={mouseMoveHandler}
      onMouseUp={mouseUpHandler}
    />
  );
};

export default Canvas;
