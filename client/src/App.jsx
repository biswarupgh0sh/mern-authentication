import FloatingShape from "./components/FloatingShape.jsx";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import EmailVerification from "./pages/Emailverification.jsx";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "../store/authStore.js";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPasswordPage from "./pages/ResetPassword.jsx";

const ProtectedRoute = ({children}) => {
  const { isAuthenticated, user} = useAuthStore();
  if(!isAuthenticated){
    return <Navigate to="/signin" replace/>
  }
  if(!user.isVerified){
    return <Navigate to="/verify-email" replace/>
  }
  return children;
}

const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    if(isAuthenticated && user.isVerified){
      return <Navigate to="/" replace/>
    }
    return children;
}


function App() {

  const { isCheckingAuth, checkAuth} = useAuthStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth]);

  if(isCheckingAuth) return <LoadingSpinner />
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center overflow-hidden relative">
     <FloatingShape color="bg-green-500" size="size-64" top="-5%" left="10%" delay={0}/>
     <FloatingShape color="bg-emerald-500" size="size-48" top="70%" left="80%" delay={5}/>
     <FloatingShape color="bg-lime-500" size="size-32" top="40%" left="-10%" delay={2}/>

    <Router>
      <Routes>
        <Route path="/" element={<ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>}/>
        <Route path="/signup" element={<RedirectAuthenticatedUser>
          <SignUp/>
        </RedirectAuthenticatedUser>}/>
        <Route path="/signin" element={<RedirectAuthenticatedUser>
          <SignIn/>
        </RedirectAuthenticatedUser>}/>
        <Route path="/verify-email" element={<EmailVerification/>}/>
        <Route path="/forgot-password" element={<RedirectAuthenticatedUser>
          <ForgotPassword/>
        </RedirectAuthenticatedUser>}/>
        <Route path="/reset-password/:token" element={<RedirectAuthenticatedUser>
          <ResetPasswordPage/>
        </RedirectAuthenticatedUser>}/>
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <Toaster/>
    </Router>

    </div>
  )
}

export default App;
