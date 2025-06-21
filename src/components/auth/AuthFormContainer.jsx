import { CheckSquare } from 'lucide-react';

export const AuthFormContainer = ({ title, children, error, onSubmit }) => (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md">
             <div className="flex items-center justify-center gap-3 mb-8">
                <CheckSquare className="h-10 w-10 text-blue-600" />
                <span className="text-4xl font-bold text-slate-800 dark:text-white">TaskMaster</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center mb-6">{title}</h2>
                {error && <p className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-md text-center mb-4 text-sm">{error}</p>}
                <form onSubmit={onSubmit} className="space-y-4">
                    {children}
                </form>
            </div>
        </div>
    </div>
);