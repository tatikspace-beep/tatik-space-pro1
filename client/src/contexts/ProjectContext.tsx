import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface ProjectContextType {
    currentProject: { id: number | null; name: string | null };
    setCurrentProject: (id: number | null, name?: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);
const STORAGE_KEY = 'tatik_current_project';

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [currentProject, setProjectState] = useState<{ id: number | null; name: string | null }>(() => {
        // Load from localStorage on mount
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : { id: null, name: null };
        } catch {
            return { id: null, name: null };
        }
    });

    const setCurrentProject = useCallback((id: number | null, name?: string) => {
        const newProject = { id, name: name || null };
        setProjectState(newProject);
        // Persist to localStorage
        if (id) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newProject));
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    return (
        <ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProject() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProject must be used within ProjectProvider');
    }
    return context;
}
