import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { Auth } from './components/Auth';

function Dashboard() {
    const { currentUser } = useTasks();

    return (
        <div className="app">
            <Header currentUser={currentUser} />
            <main className="main-container">
                <KanbanBoard />
            </main>
        </div>
    );
}

function AppContent() {
    const { isAuthenticated, currentUser } = useAuth();

    if (!isAuthenticated()) {
        return (
            <div className="app">
                <Auth />
            </div>
        );
    }

    return (
        <TaskProvider currentUser={currentUser}>
            <Dashboard />
        </TaskProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
