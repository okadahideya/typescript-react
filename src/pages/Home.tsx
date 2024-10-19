import { Box } from '@mui/material'
import React from 'react'
import Calendar from '../components/Calendar'
import MonthlySummary from '../components/MonthlySummary'
import TransactionMenu from '../components/TransactionMenu'
import TransactionForm from '../components/TransactionForm'
import { Transaction } from '../types'

interface HomeProps {
  monthlyTransactions: Transaction[],
}

const Home = ({monthlyTransactions}: HomeProps) => {
  return (
    <Box sx={{ display: "flex"}}>
      {/* 左側コンテンツ */}
      <Box sx={{flexGrow:1}}>
        <MonthlySummary monthlyTransactions={monthlyTransactions} />
        <Calendar />
      </Box>

      {/* 右側コンテンツ */}
      <Box>
        <TransactionMenu />
        <TransactionForm />
      </Box>
    </Box>
  )
}

export default Home