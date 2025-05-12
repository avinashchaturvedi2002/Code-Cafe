import ForgotPassword from "./pages/forgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RegisterUser from "./pages/RegisterUser";
import Login from "./pages/Login"
import Landing from "./pages/Landing";
import AllProblems from "./pages/AllProblems";
import ProblemDetail from "./pages/ProblemDetail";
import CreateProblem from "./pages/CreateProblem";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
function App() {


  return (
    
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<RegisterUser/>} />
        <Route path="/" element={<Landing/>} />
        <Route path="/problems" element={<AllProblems />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/createProblem" element={<CreateProblem/>}/>


      </Routes>
    
  )
}

export default App
