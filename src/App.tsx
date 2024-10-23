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
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from './components/firebase';
import { formatMonth } from './utils/formatting';
import { Schema, transactionSchema } from './validations/schema';


function App() {
  // エラー判別
  function isFireSotreError(err: unknown):err is {code: string, message: string} {
    return typeof err === "object" && err != null && "code" in err
  }
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  //一月分のデータ
  const monthlyTransactions = transactions.filter((transaction) => {
    return transaction.date.startsWith(formatMonth(currentMonth));
  })

  const handleSaveTransaction = async (transaction: Schema) => {
    try {
      // firebaseにデータ保存
      const docRef = await addDoc(collection(db, "Transactios"), transaction);
      console.log("Document written with ID: ", docRef.id);

      const newTransaction = {
        id: docRef.id,
        ...transaction
      } as Transaction;

      setTransactions([...transactions, newTransaction])
    } catch(err) {
      if(isFireSotreError(err)) {
        console.error("Firebaseエラー",err)
      } else {
        console.error(err)
      }
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteDoc(doc(db, "Transactios", transactionId));
      const filteredTransactions = transactions.filter((transaction) => transaction.id !== transactionId);
      setTransactions(filteredTransactions);
    } catch (err) {
      if(isFireSotreError(err)) {
        console.error("Firebaseエラー",err)
      } else {
        console.error(err)
      }
    }
  }

  const handleUpdateTransaction = async (transaction: Schema, transactionId: string) => {
    try {
      const docRef = doc(db, "Transactios", transactionId);
      await updateDoc(docRef, transaction);

      // フロント更新処理
      const updateTransactions = transactions.map((t) => t.id === transactionId ? {...t, ...transaction} : t) as Transaction[];
      setTransactions(updateTransactions);
    } catch (err) {
      if(isFireSotreError(err)) {
        console.error("Firebaseエラー",err)
      } else {
        console.error(err)
      }
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Applayout />}>
            <Route index element={
              <Home 
                monthlyTransactions={monthlyTransactions} 
                setCurrentMonth={setCurrentMonth}
                onSaveTransaction={handleSaveTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateTransaction={handleUpdateTransaction}
              />} 
            />
            <Route path="/report" element={<Report />} />
            <Route path="*" element={<NoMatch />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
