import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from 'components/ui/Navbar';
import styles from './AppLayout.module.css';

const AppLayout = () => (
  <div className={styles.wrapper}>
    <Navbar />
    <main className={styles.main}>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
