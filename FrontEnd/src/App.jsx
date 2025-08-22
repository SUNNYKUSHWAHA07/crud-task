import React from 'react'
import { Route, Router, Routes } from 'react-router-dom'
import NewOrder from './Pages/NewOrder'
import AllOrders from './Pages/AllOrders'
import EditOrder from './Pages/EditOrder'

const App = () => {
  return (
    <>
    <div className= "h-screen w-full bg-[url('./assets/bgimage.jpg')] bg-cover bg-center flex items-center justify-center">
   <Routes>
        <Route path="/" element={<AllOrders/>} />
    </Routes>
    </div>
   
    </>

    
  )
}

export default App