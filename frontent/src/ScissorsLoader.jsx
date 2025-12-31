import React from "react";
import styles from "./Scissors.module.css";

export default function ScissorsLoader() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white">
      <div className={`${styles.scissors}`}>
        <div className={styles.half}>
          <div className={styles.blade}></div>
          <div className={styles.handle}></div>
        </div>
        <div className={styles.half}>
          <div className={styles.blade}></div>
          <div className={styles.handle}></div>
        </div>
        <div className={styles.joint}></div>
      </div>
    </div>
  );
}
