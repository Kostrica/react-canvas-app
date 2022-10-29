import React, { useState } from 'react';
import Canvas from './components/Canvas/Canvas';

import styles from './App.module.scss';

function App() {
  const [ collapseLines, setCollapseLines ] = useState(false);

  const handleClick = () => {
    setCollapseLines(true);
  };

  const getNotCollapseLines = () => {
    setCollapseLines(false);
  };

  return (
    <div className={styles.App}>
      <div className={styles.canvasContainer}>
        <Canvas
          collapseLines={collapseLines}
          getNotCollapseLines={getNotCollapseLines}
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
