import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: any | null;
  login: (user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Implement auth logic here
  return (
    <AuthContext.Provider value={{ user: null, login: () => {}, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
