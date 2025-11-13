import { Link } from 'react-router-dom'
export default function Unauthorized(){
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-red-600">403 • Access denied</h1>
        <p>You don’t have permission to view this page.</p>
        <Link to="/dashboard" className="text-blue-600 underline">Go back</Link>
      </div>
    </div>
  )
}
