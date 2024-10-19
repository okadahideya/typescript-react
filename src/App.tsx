import React, { useEffect, useState } from 'react';
import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Report from './pages/Report';
import NoMatch from './pages/NoMatch';
import Applayout from './components/layout/Applayout';
import  {theme } from './theme/theme'
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { Transaction } from './types/index';
import { collection, getDocs } from "firebase/firestore";
import { db } from './components/firebase';
import { format } from 'date-fns';
import { formatMonth } from './utils/formatting';


function App() {

  function isFireSotreError(err: unknown):err is {code: string, message: string} {
    return typeof err === "object" && err != null && "code" in err
  }
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  format(currentMonth, "yyyy-MM");

  // firebase取得
  useEffect(() => {
    const fetchTransactions = async() => {
      try {
        const querySnapshot = await getDocs(collection(db, "Transactios"));
        const transactionsData = querySnapshot.docs.map((doc) => {
          return {
            ...doc.data(),
            id: doc.id,
          } as Transaction
        });

        setTransactions(transactionsData);
      } catch (err) {
        if(isFireSotreError(err)) {
          console.error("Firebaseエラー",err)
        } else {
          console.error(err)
        }
      }
    }
    fetchTransactions();
  }, []);

  const monthlyTransactions = transactions.filter((transaction) => {
    return transaction.date.startsWith(formatMonth(currentMonth));
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Applayout />}>
            <Route index element={<Home monthlyTransactions={monthlyTransactions}/>} />
            <Route path="/report" element={<Report />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
