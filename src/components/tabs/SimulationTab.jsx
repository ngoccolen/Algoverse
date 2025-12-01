import React, { useEffect } from "react";
import { BubbleSort } from "../visualization/BubbleSort";

export default function SimulationTab({ onComplete }) {
  useEffect(() => {
    BubbleSort("viz-container", [5, 3, 1, 4, 2], {
      speed: 600,
      onComplete,
    });
  }, [onComplete]);

  return (
    <div className="sim-tab">
      <h3>Mô phỏng Bubble Sort</h3>
      <div id="viz-container" style={{ margin: "20px auto", width: "400px", height: "200px" }}></div>
    </div>
  );
}
