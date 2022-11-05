import React, { useEffect, useRef, useState } from 'react';
import Canvas from './components/Canvas/Canvas';

import styles from './App.module.scss';

function App() {
  const appRef = useRef(null);

  const [ collapseLines, setCollapseLines ] = useState(false);
  const [ widthApp, setWidthApp ] = useState(null);

  useEffect(() => {
    const width = appRef.current.offsetWidth;

    if (width) {
      setWidthApp(width);
    }
  }, []);

  const handleClick = () => {
    setCollapseLines(true);
  };

  const getNotCollapseLines = () => {
    setCollapseLines(false);
  };

  return (
    <div
      className={styles.App}
      ref={appRef}
    >
      <div className={styles.canvasContainer}>
        <Canvas
          collapseLines={collapseLines}
          getNotCollapseLines={getNotCollapseLines}
          widthApp={widthApp}
        />
        <div className={styles.wraperButton}>
          <button
            className={styles.button}
            onClick={handleClick}
          >
            collapse lines
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
